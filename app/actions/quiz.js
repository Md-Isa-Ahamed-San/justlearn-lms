"use server";

import { getLoggedInUser } from "@/lib/loggedin-user";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";

import { chalkLog } from "../../utils/logger";

// Gamification Constants
const POINTS_LESSON_COMPLETE = 10;
const POINTS_QUIZ_PERFECT = 50;
const POINTS_QUIZ_PASS = 20;

async function awardPoints(userId, points, reason) {
    try {
        await db.user.update({
            where: { id: userId },
            data: { points: { increment: points } }
        });
        console.log(`Awarded ${points} points to user ${userId} for ${reason}`);
    } catch (error) {
        console.error(`Error awarding points: ${error.message}`);
    }
}

async function checkAndAwardBadges(userId, type) {
    try {
        // Example Badge Logic (Expand as needed)
        if (type === 'quiz_master') {
             const badge = await db.badge.findFirst({ where: { name: 'Quiz Master' } });
             if (badge) {
                 await db.userBadge.upsert({
                     where: { userId_badgeId: { userId, badgeId: badge.id } },
                     create: { userId, badgeId: badge.id },
                     update: {}
                 });
             }
        }
    } catch (error) {
         console.error(`Error checking badges: ${error.message}`);
    }
}


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

const PRIMARY_MODEL = {
  id: "llama-3.3-70b-versatile",
  name: "Llama 3.3 70B",
  maxTokens: 32768,
  contextWindow: 128000,
  maxQuestionsPerCall: 80,
};

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

function createEvaluationPrompt(question, studentAnswer, maxMark) {
  return `You are an expert evaluator. Please evaluate the following student answer with medium difficulty standards.

QUESTION: ${question}
STUDENT ANSWER: ${studentAnswer}
MAXIMUM MARKS: ${maxMark}

Please evaluate this answer and respond with ONLY a JSON object in this exact format:
{
  "marksAwarded": <number between 0 and ${maxMark}>,
  "explanation": "<act as you are the instructor and you are describing to student why this mark was give. so add a short brief explanation of why this mark was given according to the requirement.>",
  "correctAnswer": "<the ideal/correct answer for reference>"
}

Guidelines:
- Give partial marks for partially correct answers
- Give 0 marks for completely incorrect or irrelevant answers
- Be fair but maintain medium difficulty standards
- CRITICAL REQUIREMENT: Marks must be a number between 0 and ${maxMark}`;
}

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
export async function updateCourseProgressAfterQuizOrLesson(userId, courseId, accomplished) {
  try {
    console.log(`Updating course progress for user: ${userId}, course: ${courseId}, accomplished: ${accomplished}`);

    // Step 1: Get current course structure (total counts)
    const courseStructure = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        weeks: {
          select: {
            id: true,
            quizIds: true,
            lessons: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!courseStructure) {
      console.error(`Course not found: ${courseId}`);
      return { success: false, error: "Course not found" };
    }

    // Step 2: Calculate current course totals
    const totalWeeks = courseStructure.weeks.length;
    const totalLessons = courseStructure.weeks.reduce((sum, week) => sum + week.lessons.length, 0);
    
    // Get unique quiz IDs across all weeks (since quizzes can be in multiple weeks)
    const allQuizIds = new Set();
    courseStructure.weeks.forEach(week => {
      week.quizIds.forEach(quizId => allQuizIds.add(quizId));
    });
    const totalQuizzes = allQuizIds.size;

    console.log(`Course structure - Weeks: ${totalWeeks}, Lessons: ${totalLessons}, Quizzes: ${totalQuizzes}`);

    // Step 3: Get user's current progress or set defaults
    const currentProgress = await db.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    // Step 4: Calculate new completion counts
    let newCompletedLessons = currentProgress?.completedLessons || 0;
    let newCompletedQuizzes = currentProgress?.completedQuizzes || 0;

    // Increment based on what was accomplished
    if (accomplished === "lesson") {
      newCompletedLessons += 1;
    } else if (accomplished === "quiz") {
      newCompletedQuizzes += 1;
    }

    console.log(`Updated completion - Lessons: ${newCompletedLessons}, Quizzes: ${newCompletedQuizzes}`);

    // Step 5: Calculate progress percentage
    const totalItems = totalLessons + totalQuizzes;
    const completedItems = newCompletedLessons + newCompletedQuizzes;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Step 6: Determine status
    let status = "not_started";
    if (completedItems > 0 && completedItems < totalItems) {
      status = "in_progress";
    } else if (completedItems >= totalItems && totalItems > 0) {
      status = "completed";
    }

    // Step 7: Calculate completed weeks (simplified - you might want to refine this logic)
    const completedWeeks = Math.floor((completedItems / totalItems) * totalWeeks) || 0;

    // Step 8: Create or update course progress
    let updatedProgress;
    
    if (currentProgress) {
      // Update existing progress record
      updatedProgress = await db.courseProgress.update({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: courseId
          }
        },
        data: {
          status: status,
          progress: progressPercentage,
          totalWeeks: totalWeeks,
          totalLessons: totalLessons,
          totalQuizzes: totalQuizzes,
          completedLessons: newCompletedLessons,
          completedQuizzes: newCompletedQuizzes,
          completedWeeks: completedWeeks,
          lastActivityDate: new Date(),
          completionDate: status === "completed" ? new Date() : null
        }
      });
    } else {
      // Create new progress record
      updatedProgress = await db.courseProgress.create({
        data: {
          userId: userId,
          courseId: courseId,
          status: status,
          progress: progressPercentage,
          totalWeeks: totalWeeks,
          totalLessons: totalLessons,
          totalQuizzes: totalQuizzes,
          completedLessons: newCompletedLessons,
          completedQuizzes: newCompletedQuizzes,
          completedWeeks: completedWeeks,
          lastActivityDate: new Date(),
          completionDate: status === "completed" ? new Date() : null
        }
      });
    }

    console.log(`Course progress updated successfully. Progress: ${progressPercentage}% (${status})`);
    
    // Gamification Triggers
    if (accomplished === 'lesson') {
        await awardPoints(userId, POINTS_LESSON_COMPLETE, 'Lesson Completion');
    }

    // Certificate Issuance Logic
    if (status === 'completed' && !currentProgress?.isCertified) {
        console.log(`User ${userId} completed course ${courseId}. Issuing certificate...`);
        
        // Create snapshot of course structure
        const snapshotData = {
            courseTitle: courseStructure.title,
            completedAt: new Date(),
            totalWeeks: totalWeeks,
            totalLessons: totalLessons,
            totalQuizzes: totalQuizzes
        };

        // Issue Certificate
        await db.certificate.create({
            data: {
                userId: userId,
                courseId: courseId,
                certificateLink: `/certificates/${userId}/${courseId}`, // Placeholder link logic
                snapshotData: snapshotData
            }
        });

        // Mark as certified to prevent re-issuance or regression
        await db.courseProgress.update({
             where: { userId_courseId: { userId, courseId } },
             data: { isCertified: true }
        });
        
        console.log(`Certificate issued for user ${userId} in course ${courseId}`);
    }


    return {
      success: true,
      data: {
        progress: progressPercentage,
        status: status,
        completedItems: completedItems,
        totalItems: totalItems,
        completedQuizzes: newCompletedQuizzes,
        completedLessons: newCompletedLessons
      }
    };

  } catch (error) {
    console.error("Error updating course progress:", error);
    return { 
      success: false, 
      error: "Failed to update course progress",
      details: error.message 
    };
  }
}
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
    chalkLog.log(`Quiz submission data: ${data}`);


    // Step 2: Validate required data
    if (!data.quizId || !data.answers || Object.keys(data.answers).length === 0) {
      return {
        success: false,
        error: "Invalid submission data - missing quiz ID or answers"
      };
    }

    const quizId = data.quizId;
    const answerEntries = Object.values(data.answers);

    console.log(`Processing ${answerEntries.length} answers for quiz: ${quizId}`);

    // Step 3: Validate quiz exists and get basic info
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        active: true,
        status: true
      }
    });

    if (!quiz) {
      return {
        success: false,
        error: "Quiz not found"
      };
    }

    if (!quiz.active || quiz.status !== 'published') {
      return {
        success: false,
        error: "Quiz is not available for submission"
      };
    }

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
          courseId: data.courseId,
          startTime: new Date(),
          endTime: new Date(),
          attemptNumber: 1,
          violations: data.violations || [],
          warningCount: data.warningCount || 0,
          warningMessage: data.warningMessage || "",
          isFullscreenSupported: data.isFullscreenSupported ?? true,
          disconnectionCount: data.disconnectionCount || 0,
          totalOfflineCount: data.totalOfflineTime || 0,
          submissionReason: data.submissionReason || "manual_submit" // 🔥 Use the reason from client
        }
      });
     
    } else {
      return {
        success: false,
        error: "Quiz submission already exists for you",
      };
    }

    console.log(`Quiz submission created/updated: ${quizSubmission.id}`);

    // Step 5: Separate answers by processing type
    const mcqAnswers = [];
    const aiEvaluationNeeded = [];
    
    for (const answerData of answerEntries) {
      // 🔥 NEW: Check if answer is empty (unanswered question)
      const isEmpty = 
        (Array.isArray(answerData.answer) && answerData.answer.length === 0) ||
        answerData.answer === "" ||
        answerData.answer === null ||
        answerData.answer === undefined;

      if (answerData.questionType === 'mcq') {
        // Process MCQ directly using provided data
        const marksAwarded = isEmpty ? 0 : (answerData.isCorrect ? answerData.mark : 0);
        mcqAnswers.push({
          questionId: answerData.questionId,
          submittedAnswer: answerData.answer, // Will be empty array [] for unanswered
          isCorrect: isEmpty ? false : answerData.isCorrect,
          marksAwarded: marksAwarded,
          answerExplanation: isEmpty ? {
            explanation: "Question not answered",
            correctAnswer: "No answer provided"
          } : {
            explanation: answerData.isCorrect ? "Correct answer" : "Incorrect answer",
            correctAnswer: "See quiz results for correct answer"
          }
        });
      } else {
        // 🔥 NEW: Handle empty answers for text questions
        if (isEmpty) {
          // Add as unanswered record (no AI evaluation needed)
          mcqAnswers.push({
            questionId: answerData.questionId,
            submittedAnswer: "", // Empty string for unanswered text questions
            isCorrect: false,
            marksAwarded: 0,
            answerExplanation: {
              explanation: "Question not answered",
              correctAnswer: "No answer provided"
            }
          });
        } else {
          // Queue for AI evaluation (short_answer, long_answer)
          aiEvaluationNeeded.push({
            questionId: answerData.questionId,
            question: answerData.question,
            studentAnswer: answerData.answer,
            maxMark: answerData.mark
          });
        }
      }
    }

    console.log(`Processing ${mcqAnswers.length} direct answers (MCQ + unanswered) and ${aiEvaluationNeeded.length} AI evaluations needed`);

    // Step 6: Process AI evaluations for non-MCQ questions (only answered ones)
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

    // Step 7: Prepare all student answer records
    const allAnswerRecords = [];
    
    // Add MCQ and unanswered text answers
    for (const mcqAnswer of mcqAnswers) {
      allAnswerRecords.push({
        ...mcqAnswer,
        quizSubmissionId: quizSubmission.id,
        timeSpent: 0
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

    console.log(`Created ${allAnswerRecords.length} student answer records (including ${mcqAnswers.filter(a => a.submittedAnswer === "" || (Array.isArray(a.submittedAnswer) && a.submittedAnswer.length === 0)).length} unanswered)`);

    // Step 9: Calculate total score and update quiz submission
    const totalScore = allAnswerRecords.reduce((sum, answer) => sum + answer.marksAwarded, 0);
    const maxPossibleScore = answerEntries.reduce((sum, answer) => sum + answer.mark, 0);
    const percentageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    // Update quiz submission with final results
    const finalSubmission = await db.quizSubmission.update({
      where: { id: quizSubmission.id },
      data: {
        endTime: new Date(),
        score: totalScore,
        maxScore: maxPossibleScore, // 🔥 Add maxScore to the update
        timeSpent: quizSubmission.startTime ? 
          Math.floor((new Date() - new Date(quizSubmission.startTime)) / 1000) : 0,
      }
    });
    
    let accomplished = "quiz"
    await updateCourseProgressAfterQuizOrLesson(loggedInUser.id, data.courseId, accomplished)
    
    console.log(`Quiz submission completed. Score: ${totalScore}/${maxPossibleScore} (${percentageScore.toFixed(2)}%)`);

    // Step 10: Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath(`/quiz/${quizId}`);

    // Step 11: Return success response
    return {
      success: true,
      data: {
        submissionId: finalSubmission.id,
        totalScore: totalScore,
        maxScore: maxPossibleScore,
        percentage: percentageScore,
        totalAnswers: allAnswerRecords.length,
        answeredQuestions: allAnswerRecords.filter(a => 
          a.submittedAnswer !== "" && 
          !(Array.isArray(a.submittedAnswer) && a.submittedAnswer.length === 0)
        ).length,
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

export async function getQuizSubmissionDetails({
  courseId,
  quizId,
  userId,
}) {
  try {
    // Validate input parameters
    if (!courseId || !quizId || !userId) {
      return {
        success: false,
        error: "Missing required parameters: courseId, quizId, and userId are required",
      };
    }

    // Get quiz submission details
    const quizSubmission = await db.quizSubmission.findFirst({
      where: {
        courseId,
        quizId,
        userId,
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        score: true,
        attemptNumber: true,
        timeSpent: true,
        submissionReason: true,
        disconnectionCount: true,
        isFullscreenSupported: true,
        totalOfflineCount: true,
        violations: true,
        warningCount: true,
        warningMessage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get all student answers for this submission
    let studentAnswers= [];
    
    if (quizSubmission) {
      studentAnswers = await db.studentAnswer.findMany({
        where: {
          quizSubmissionId: quizSubmission.id,
        },
        select: {
          id: true,
          submittedAnswer: true,
          answerExplanation: true,
          isCorrect: true,
          marksAwarded: true,
          timeSpent: true,
          createdAt: true,
          updatedAt: true,
          question: {
            select: {
              id: true,
              type: true,
              text: true,
              image: true,
              explanation: true,
              options: true,
              correctAnswer: true,
              mark: true,
              order: true,
            },
          },
        },
        orderBy: {
          question: {
            order: 'asc',
          },
        },
      });
    }

    return {
      success: true,
      data: {
        submission: quizSubmission,
        answers: studentAnswers,
      },
    };
  } catch (error) {
    console.error("Error fetching quiz submission details:", error);
    return {
      success: false,
      error: "Failed to fetch quiz submission details. Please try again.",
    };
  }
}
