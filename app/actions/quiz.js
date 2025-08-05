"use server";

import { getLoggedInUser } from "@/lib/loggedin-user";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import { revalidatePath } from 'next/cache';

// Initialize multiple Groq instances for load balancing
const groqInstances = [
  new Groq({
    apiKey: process.env.GROQ_API_KEY_1,
  }),
  new Groq({
    apiKey: process.env.GROQ_API_KEY_2,
  }),
  new Groq({
    apiKey: process.env.GROQ_API_KEY_3,
  }),
  new Groq({
    apiKey: process.env.GROQ_API_KEY_4,
  }),
];

// Primary model configuration
const PRIMARY_MODEL = {
  id: "llama-3.3-70b-versatile",
  name: "Llama 3.3 70B",
  maxTokens: 32768,
  contextWindow: 128000,
  maxQuestionsPerCall: 80,
};

// Fallback models
const FALLBACK_MODELS = [
  {
    id: "meta-llama/llama-4-maverick-17b-128e-instruct",
    name: "Llama 4 Maverick",
    maxTokens: 8192,
    contextWindow: 131072,
    maxQuestionsPerCall: 40,
  },
  {
    id: "llama3-70b-8192",
    name: "Llama3 70B",
    maxTokens: 8192,
    contextWindow: 8192,
    maxQuestionsPerCall: 40,
  },
];

/**
 * Get a random Groq instance for load balancing
 */
function getRandomGroqInstance() {
  return groqInstances[Math.floor(Math.random() * groqInstances.length)];
}

/**
 * Create AI prompt for evaluating student answers
 */
function createEvaluationPrompt(question, studentAnswer, maxMark) {
  return `You are an expert evaluator. Please evaluate the following student answer with medium difficulty standards.

QUESTION: ${question.text}
STUDENT ANSWER: ${studentAnswer}
MAXIMUM MARKS: ${maxMark}

Please evaluate this answer and respond with ONLY a JSON object in this exact format:
{
  "marksAwarded": <number between 0 and ${maxMark}>,
  "explanation": "<brief explanation of why this mark was given>",
  "correctAnswer": "<the ideal/correct answer for reference>"
}

Guidelines:
- Give partial marks for partially correct answers
- Give 0 marks for completely incorrect or irrelevant answers
- Be fair but maintain medium difficulty standards
- Marks must be a number between 0 and ${maxMark}`;
}

/**
 * Evaluate answers using AI with retry logic
 */
async function evaluateWithAI(questions, maxRetries = 3) {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  
  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const currentModel = models[modelIndex];
    
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const groq = getRandomGroqInstance();
        
        // Process questions in batches to respect model limits
        const batchSize = currentModel.maxQuestionsPerCall;
        const results = [];
        
        for (let i = 0; i < questions.length; i += batchSize) {
          const batch = questions.slice(i, i + batchSize);
          
          // Create individual prompts for each question in batch
          const batchPromises = batch.map(async (item) => {
            const prompt = createEvaluationPrompt(
              item.question, 
              item.studentAnswer, 
              item.maxMark
            );
            
            const completion = await groq.chat.completions.create({
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              model: currentModel.id,
              max_tokens: currentModel.maxTokens,
              temperature: 0.1, // Low temperature for consistent grading
            });
            
            const response = completion.choices[0]?.message?.content?.trim();
            
            try {
              const parsed = JSON.parse(response);
              return {
                questionId: item.questionId,
                marksAwarded: Math.min(Math.max(0, parsed.marksAwarded), item.maxMark),
                explanation: parsed.explanation || "No explanation provided",
                correctAnswer: parsed.correctAnswer || "Not provided"
              };
            } catch (parseError) {
              console.error(`JSON parse error for question ${item.questionId}:`, parseError);
              // Return zero marks if parsing fails
              return {
                questionId: item.questionId,
                marksAwarded: 0,
                explanation: "AI response parsing failed",
                correctAnswer: "Could not determine"
              };
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
        }
        
        console.log(`Successfully evaluated ${results.length} questions using ${currentModel.name}`);
        return results;
        
      } catch (error) {
        console.error(`AI evaluation failed with ${currentModel.name}, retry ${retry + 1}:`, error);
        
        // If this is the last retry with the last model, throw the error
        if (modelIndex === models.length - 1 && retry === maxRetries - 1) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        if (retry < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retry) * 1000));
        }
      }
    }
  }
}

/**
 * Main function to submit quiz with student answers
 */
export async function submitQuizWithStudentAnswer(data) {
  try {
    // Step 1: Validate user authentication
    const loggedInUser = await getLoggedInUser();
    if (!loggedInUser) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    console.log(`Processing quiz submission for user: ${loggedInUser.id}`);

    // Step 2: Extract quiz ID from the first answer (assuming all answers are for the same quiz)
    const firstAnswerKey = Object.keys(data.answers)[0];
    if (!firstAnswerKey) {
      return {
        success: false,
        error: "No answers provided"
      };
    }

    // Step 3: Get all questions for this quiz to validate and get quiz info
    const questionIds = Object.keys(data.answers);
    const questions = await db.question.findMany({
      where: {
        id: { in: questionIds }
      },
      include: {
        quiz: true
      }
    });

    if (questions.length === 0) {
      return {
        success: false,
        error: "No valid questions found"
      };
    }

    const quiz = questions[0].quiz;
    const quizId = quiz.id;

    console.log(`Processing ${questions.length} questions for quiz: ${quiz.title}`);

    // Step 4: Create or get existing quiz submission
    let quizSubmission = await db.quizSubmission.findFirst({
      where: {
        userId: loggedInUser.id,
        quizId: quizId
      }
    });

    if (!quizSubmission) {
      // Create new submission
      quizSubmission = await db.quizSubmission.create({
        data: {
          userId: loggedInUser.id,
          quizId: quizId,
          startTime: new Date(),
          attemptNumber: 1,
          violations: data.violations || [],
          warningCount: data.warningCount || 0,
          warningMessage: data.warningMessage || "",
          isFullscreenSupported: data.isFullscreenSupported ?? true,
          disconnectionCount: data.disconnectionCount || 0,
          totalOfflineCount: data.totalOfflineTime || 0,
          submissionReason: "manual_submit"
        }
      });
    }

    console.log(`Quiz submission created/found: ${quizSubmission.id}`);

    // Step 5: Separate MCQ and non-MCQ questions for processing
    const mcqAnswers = [];
    const aiEvaluationNeeded = [];
    
    for (const question of questions) {
      const answerData = data.answers[question.id];
      
      if (question.type === 'mcq') {
        // Process MCQ immediately
        const isCorrect = JSON.stringify(answerData.answer) === JSON.stringify(question.correctAnswer);
        mcqAnswers.push({
          questionId: question.id,
          submittedAnswer: answerData.answer,
          isCorrect: isCorrect,
          marksAwarded: isCorrect ? question.mark : 0,
          answerExplanation: {
            explanation: isCorrect ? "Correct answer" : "Incorrect answer",
            correctAnswer: question.correctAnswer
          }
        });
      } else {
        // Queue for AI evaluation
        aiEvaluationNeeded.push({
          questionId: question.id,
          question: question,
          studentAnswer: answerData.answer,
          maxMark: question.mark
        });
      }
    }

    console.log(`Processing ${mcqAnswers.length} MCQ answers and ${aiEvaluationNeeded.length} AI evaluation needed`);

    // Step 6: Process AI evaluations for short and long answers
    let aiResults = [];
    if (aiEvaluationNeeded.length > 0) {
      try {
        console.log("Starting AI evaluation...");
        aiResults = await evaluateWithAI(aiEvaluationNeeded);
        console.log("AI evaluation completed successfully");
      } catch (error) {
        console.error("AI evaluation failed completely:", error);
        return {
          success: false,
          error: "Failed to evaluate answers. Please try again later."
        };
      }
    }

    // Step 7: Create all student answer records
    const allAnswerRecords = [];
    
    // Add MCQ answers
    for (const mcqAnswer of mcqAnswers) {
      allAnswerRecords.push({
        ...mcqAnswer,
        quizSubmissionId: quizSubmission.id,
        timeSpent: 0 // Could be enhanced to track individual question time
      });
    }
    
    // Add AI evaluated answers
    for (const aiResult of aiResults) {
      const originalQuestion = aiEvaluationNeeded.find(q => q.questionId === aiResult.questionId);
      allAnswerRecords.push({
        questionId: aiResult.questionId,
        quizSubmissionId: quizSubmission.id,
        submittedAnswer: originalQuestion.studentAnswer,
        isCorrect: aiResult.marksAwarded === originalQuestion.maxMark,
        marksAwarded: aiResult.marksAwarded,
        answerExplanation: {
          explanation: aiResult.explanation,
          correctAnswer: aiResult.correctAnswer
        },
        timeSpent: 0
      });
    }

    // Step 8: Bulk create all student answers
    await db.studentAnswer.createMany({
      data: allAnswerRecords
    });

    console.log(`Created ${allAnswerRecords.length} student answer records`);

    // Step 9: Calculate total score and update quiz submission
    const totalScore = allAnswerRecords.reduce((sum, answer) => sum + answer.marksAwarded, 0);
    const maxPossibleScore = questions.reduce((sum, question) => sum + question.mark, 0);
    const percentageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    // Update quiz submission with final results
    await db.quizSubmission.update({
      where: { id: quizSubmission.id },
      data: {
        endTime: new Date(),
        score: percentageScore,
        timeSpent: Math.floor((new Date() - new Date(quizSubmission.startTime)) / 1000), // in seconds
        // Note: status field was commented out in schema, so not updating it
      }
    });

    console.log(`Quiz submission completed. Score: ${totalScore}/${maxPossibleScore} (${percentageScore.toFixed(2)}%)`);

    // Step 10: Revalidate relevant paths (user will be redirected to previous URL)
    revalidatePath('/dashboard');
    revalidatePath(`/quiz/${quizId}`);

    // Step 11: Return success response
    return {
      success: true,
      data: {
        submissionId: quizSubmission.id,
        totalScore: totalScore,
        maxScore: maxPossibleScore,
        percentage: percentageScore,
        answers: allAnswerRecords.map(answer => ({
          questionId: answer.questionId,
          marksAwarded: answer.marksAwarded,
          isCorrect: answer.isCorrect,
          explanation: answer.answerExplanation
        }))
      }
    };

  } catch (error) {
    console.error("Quiz submission error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while submitting the quiz. Please try again."
    };
  }
}