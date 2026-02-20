import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY_1, // Using first key for tutor
});

const SYSTEM_PROMPT = `You are a helpful and Socratic AI Tutor for a university-level Learning Management System.
Your goal is to help students understand concepts deeper, NOT to give them direct answers to quizzes or assignments.

GUIDELINES:
1. If asked for a direct answer (e.g., "What is the answer to Q5?"), refuse politely and explain the concept instead.
2. Use analogies and simple language to explain complex topics.
3. Be encouraging and patient.
4. Keep responses concise (under 150 words) unless asked for a detailed explanation.
5. Use markdown for formatting (bold, italics, lists).

CONTEXT AWARENESS:
You will be provided with the "Current Lesson Context". Use this to tailor your explanations to what the student is currently learning.`;

export async function POST(request) {
    try {
        const { message, history, lessonContext } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Prepare messages array
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...(history || []).slice(-4), // Keep last 4 turns for context
            { 
                role: "user", 
                content: `Context: ${lessonContext || "General Inquiry"}\n\nStudent Question: ${message}` 
            }
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500,
        });

        const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

        return NextResponse.json({ response });

    } catch (error) {
        console.error("AI Tutor Error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
