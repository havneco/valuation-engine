
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message, context, history } = await req.json();

        // 1. Select the Model (Gemini 1.5 Pro is the "smartest" for reasoning)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            tools: [
                // 2. Enable Google Search Grounding
                { googleSearch: {} } as any
            ]
        });

        // 3. Construct System Prompt with Valuation Context
        const systemPrompt = `
You are an expert Valuation Analyst Copilot. 
You are helping a user evaluate a startup.

CURRENT VALUATION CONTEXT:
- Sector: ${context.sector}
- Region: ${context.region}
- Revenue: $${context.vcInputs?.exitRevenue?.toLocaleString() || "0"} (Projected Exit)
- Investment Ask: $${context.vcInputs?.investmentAmount?.toLocaleString() || "0"}
- Team Strength: ${context.scorecardInputs?.teamScore > 1 ? "Strong" : "Average/Weak"}

YOUR GOAL:
- Answer the user's question using the Context above.
- Use Google Search to find REAL market data (multiples, trends, similar exits) to support your answer.
- Be concise, professional, and data-driven.
- If the user asks for a recommendation, provide a specific valuation range based on the data.

USER QUESTION:
${message}
`;

        // 4. Generate Content
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Extract grounding metadata (citations) if available
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        return NextResponse.json({
            text,
            groundingMetadata
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({
            text: "I'm having trouble connecting to the market data right now. Please check your API key."
        }, { status: 500 });
    }
}
