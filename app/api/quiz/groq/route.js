// app/api/groq/route.js
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

// Initialize multiple Groq instances with different API keys
const groqInstances = [
  new Groq({
    apiKey: process.env.GROQ_API_KEY_1, // First account
  }),
  new Groq({
    apiKey: process.env.GROQ_API_KEY_2, // Second account
  }),
  new Groq({
    apiKey: process.env.GROQ_API_KEY_3, // Third account
  })
];

// Primary model configuration - using the best model across all accounts
const PRIMARY_MODEL = {
  id: "llama-3.3-70b-versatile",
  name: "Llama 3.3 70B",
  maxTokens: 32768,
  contextWindow: 128000,
  maxQuestionsPerCall: 80 // Conservative limit per call
};

// Fallback models in case primary model fails
const FALLBACK_MODELS = [
  {
    id: "meta-llama/llama-4-maverick-17b-128e-instruct", 
    name: "Llama 4 Maverick",
    maxTokens: 8192,
    contextWindow: 131072,
    maxQuestionsPerCall: 40
  },
  {
    id: "llama3-70b-8192",
    name: "Llama3 70B",
    maxTokens: 8192,
    contextWindow: 8192,
    maxQuestionsPerCall: 40
  }
];

// Helper function to extract text from file
async function extractTextFromFile(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let extractedText = "";

  try {
    if (file.type === "application/pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (file.type.includes("word") || file.type.includes("document")) {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (file.type === "text/plain") {
      extractedText = buffer.toString("utf8");
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }

  return extractedText;
}

// Smart distribution function for multiple accounts
function calculateMultiAccountDistribution(targetMcq, targetShort, targetLong) {
  const totalQuestions = targetMcq + targetShort + targetLong;
  
  // For very large requests, distribute across 3 accounts
  if (totalQuestions > 100) {
    // Account 1 - Takes the largest share
    const account1 = {
      mcq: Math.ceil(targetMcq * 0.4), // 40%
      short: Math.ceil(targetShort * 0.4),
      long: Math.ceil(targetLong * 0.4)
    };
    
    // Account 2 - Takes medium share
    const account2 = {
      mcq: Math.ceil(targetMcq * 0.35), // 35%
      short: Math.ceil(targetShort * 0.35),
      long: Math.ceil(targetLong * 0.35)
    };
    
    // Account 3 - Takes remaining questions
    const account3 = {
      mcq: Math.max(0, targetMcq - account1.mcq - account2.mcq),
      short: Math.max(0, targetShort - account1.short - account2.short),
      long: Math.max(0, targetLong - account1.long - account2.long)
    };
    
    return [account1, account2, account3];
  }
  
  // For medium requests (31-100), use 2 accounts
  if (totalQuestions > 30) {
    const account1 = {
      mcq: Math.ceil(targetMcq / 2),
      short: Math.ceil(targetShort / 2),
      long: Math.ceil(targetLong / 2)
    };
    
    const account2 = {
      mcq: targetMcq - account1.mcq,
      short: targetShort - account1.short,
      long: targetLong - account1.long
    };
    
    return [account1, account2, { mcq: 0, short: 0, long: 0 }];
  }
  
  // For small requests, use single account
  return [
    { mcq: targetMcq, short: targetShort, long: targetLong },
    { mcq: 0, short: 0, long: 0 },
    { mcq: 0, short: 0, long: 0 }
  ];
}

// Generate questions with a specific Groq instance and model
async function generateWithGroqInstance(groqInstance, model, contextData, aiPrompt, targetMcq, targetShort, targetLong, accountId) {
  const totalRequested = targetMcq + targetShort + targetLong;
  
  if (totalRequested === 0) {
    return {
      account: accountId,
      model: model.name,
      questions: [],
      requestedCounts: { mcq: targetMcq, short: targetShort, long: targetLong }
    };
  }

  const systemPrompt = `You are an expert quiz generator. You MUST generate EXACTLY the requested number of questions for each type.

STRICT REQUIREMENTS:
- Generate EXACTLY ${targetMcq} multiple choice questions (no more, no less)
- Generate EXACTLY ${targetShort} short answer questions (no more, no less)  
- Generate EXACTLY ${targetLong} long answer questions (no more, no less)
- Total questions MUST be exactly ${totalRequested}
- Each MCQ should have 4 options with only one correct answer around 60%-70% times and two correct answers around 30%-40% times
- Provide explanations for all questions
- Questions should be relevant to the context provided
- Vary difficulty levels appropriately
- This is Account ${accountId} processing part of a larger batch

CRITICAL: You MUST return a valid JSON object with the EXACT structure below. Do not include any text before or after the JSON:

{
  "questions": [
    {
      "type": "mcq",
      "text": "Question text here",
      "options": [
        {"label": "Option A", "isCorrect": true},
        {"label": "Option B", "isCorrect": false},
        {"label": "Option C", "isCorrect": false},
        {"label": "Option D", "isCorrect": false}
      ],
      "correctAnswer": "A",
      "explanation": "Explanation here",
      "mark": 1
    },
    {
      "type": "short_answer",
      "text": "Question text here",
      "correctAnswer": "Expected answer",
      "explanation": "Explanation here", 
      "mark": 2
    },
    {
      "type": "long_answer",
      "text": "Question text here",
      "correctAnswer": "Expected comprehensive answer",
      "explanation": "Explanation here",
      "mark": 5
    }
  ]
}`;

  const maxContextLength = Math.min(model.contextWindow - 3000, 10000); // More conservative
  const truncatedContext = contextData.substring(0, maxContextLength);

  const userPrompt = `Context: ${truncatedContext}${contextData.length > maxContextLength ? "...(truncated)" : ""}

${aiPrompt ? `Additional Instructions: ${aiPrompt}` : ""}

Generate exactly ${targetMcq} MCQ questions, ${targetShort} short answer questions, and ${targetLong} long answer questions based on this context. Return ONLY the JSON object, no other text.`;

  console.log(`[Account ${accountId} - ${model.name}] Requesting: MCQ=${targetMcq}, Short=${targetShort}, Long=${targetLong}, Total=${totalRequested}`);

  const completion = await groqInstance.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model: model.id,
    temperature: 0.3,
    max_tokens: Math.min(model.maxTokens, 20000), // Increased for large batches
  });

  const response = completion.choices[0]?.message?.content;

  if (!response) {
    throw new Error(`No response from Account ${accountId} - ${model.name}`);
  }

  // Parse JSON response
  let parsedResponse;
  try {
    let jsonStr = response.trim();
    jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    
    const jsonStart = jsonStr.indexOf("{");
    const jsonEnd = jsonStr.lastIndexOf("}");
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No valid JSON structure found in response");
    }
    
    jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    parsedResponse = JSON.parse(jsonStr);
  } catch (parseError) {
    console.error(`[Account ${accountId} - ${model.name}] Failed to parse response:`, response.substring(0, 500));
    throw new Error(`Invalid JSON response from Account ${accountId} - ${model.name}: ${parseError.message}`);
  }

  const questions = parsedResponse.questions || [];
  console.log(`[Account ${accountId} - ${model.name}] Generated ${questions.length} questions`);

  return {
    account: accountId,
    model: model.name,
    questions,
    requestedCounts: { mcq: targetMcq, short: targetShort, long: targetLong }
  };
}

// Try generation with fallback models if primary fails
async function generateWithFallback(groqInstance, contextData, aiPrompt, targetMcq, targetShort, targetLong, accountId) {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  
  for (let i = 0; i < models.length; i++) {
    try {
      return await generateWithGroqInstance(
        groqInstance, 
        models[i], 
        contextData, 
        aiPrompt, 
        targetMcq, 
        targetShort, 
        targetLong, 
        accountId
      );
    } catch (error) {
      console.error(`[Account ${accountId} - ${models[i].name}] Failed:`, error.message);
      
      if (i === models.length - 1) {
        throw error; // Last model failed, propagate error
      }
      
      console.log(`[Account ${accountId}] Trying fallback model: ${models[i + 1].name}`);
    }
  }
}

export async function POST(request) {
  try {
    // Check if request is multipart/form-data (file upload) or JSON
    const contentType = request.headers.get("content-type");
    let body, file;

    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = {
        quizId: formData.get("quizId"),
        aiPrompt: formData.get("aiPrompt"),
        contextText: formData.get("contextText"),
        targetMcq: parseInt(formData.get("targetMcq")) || 0,
        targetShort: parseInt(formData.get("targetShort")) || 0,
        targetLong: parseInt(formData.get("targetLong")) || 0,
      };
      file = formData.get("contextFile");
    } else {
      body = await request.json();
    }

    const {
      quizId,
      aiPrompt,
      contextText,
      targetMcq = 0,
      targetShort = 0,
      targetLong = 0,
    } = body;

    // Validate that at least one question type is requested
    const totalRequested = targetMcq + targetShort + targetLong;
    if (totalRequested === 0) {
      return NextResponse.json(
        { error: "At least one question type must be requested" },
        { status: 400 }
      );
    }

    if (!contextText && !file) {
      return NextResponse.json(
        { error: "Context text or file is required" },
        { status: 400 }
      );
    }

    // Prepare the context data
    let contextData = contextText || "";

    if (file) {
      try {
        const extractedText = await extractTextFromFile(file);
        contextData = extractedText;
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to extract text from file: ${error.message}` },
          { status: 400 }
        );
      }
    }

    if (!contextData.trim()) {
      return NextResponse.json(
        { error: "No valid context data found" },
        { status: 400 }
      );
    }

    console.log(`Processing request for ${totalRequested} total questions (MCQ: ${targetMcq}, Short: ${targetShort}, Long: ${targetLong})`);

    // Calculate distribution across accounts
    const distributions = calculateMultiAccountDistribution(targetMcq, targetShort, targetLong);
    
    // Create generation promises for parallel execution across accounts
    const generationPromises = distributions.map((dist, index) => {
      if (dist.mcq <= 0 && dist.short <= 0 && dist.long <= 0) {
        return Promise.resolve({ 
          account: index + 1,
          model: "Skipped", 
          questions: [], 
          requestedCounts: { mcq: 0, short: 0, long: 0 } 
        });
      }

      return generateWithFallback(
        groqInstances[index],
        contextData,
        aiPrompt,
        dist.mcq,
        dist.short,
        dist.long,
        index + 1
      );
    });

    // Execute all generations in parallel
    console.log("Starting parallel generation across multiple Groq accounts...");
    const results = await Promise.allSettled(generationPromises);

    // Process results
    const allQuestions = [];
    const errors = [];
    const accountResults = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.questions.length > 0) {
        allQuestions.push(...result.value.questions);
        accountResults.push({
          account: result.value.account,
          model: result.value.model,
          generated: result.value.questions.length,
          requested: result.value.requestedCounts
        });
      } else if (result.status === 'rejected') {
        console.error(`Account ${index + 1} failed:`, result.reason);
        errors.push({
          account: index + 1,
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "All accounts failed to generate questions", details: errors },
        { status: 500 }
      );
    }

    // Format questions
    const formattedQuestions = allQuestions.map((question, index) => {
      const baseQuestion = {
        id: `ai-${question.type}-${Date.now()}-${index}`,
        type: question.type,
        text: question.text,
        explanation: question.explanation || "",
        mark: question.mark || (question.type === "mcq" ? 1 : question.type === "short_answer" ? 2 : 5),
        order: index,
        isFromPool: false,
      };

      if (question.type === "mcq") {
        return {
          ...baseQuestion,
          options: question.options || [],
          correctAnswer: question.correctAnswer || "",
        };
      } else {
        return {
          ...baseQuestion,
          correctAnswer: question.correctAnswer || "",
        };
      }
    });

    const finalBreakdown = {
      mcq: formattedQuestions.filter((q) => q.type === "mcq").length,
      short_answer: formattedQuestions.filter((q) => q.type === "short_answer").length,
      long_answer: formattedQuestions.filter((q) => q.type === "long_answer").length,
    };

    console.log(`Successfully generated ${formattedQuestions.length} questions using multi-account strategy`);

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      totalQuestions: formattedQuestions.length,
      strategy: "multi_account_parallel",
      accountResults,
      errors: errors.length > 0 ? errors : null,
      requested: { mcq: targetMcq, short_answer: targetShort, long_answer: targetLong, total: totalRequested },
      breakdown: finalBreakdown,
      efficiency: `${Math.round((formattedQuestions.length / totalRequested) * 100)}%`
    });

  } catch (error) {
    console.error("Error generating quiz with multi-account approach:", error);

    return NextResponse.json(
      {
        error: "Failed to generate quiz questions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}