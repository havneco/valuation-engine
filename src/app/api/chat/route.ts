
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message, context, mode } = await req.json();

        // --- MODE: GUT CHECK ANALYSIS ---
        if (mode === 'gut_check') {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // No search needed for pure sentiment analysis usually, but could add if needed.

            const systemPrompt = `
            You are an expert Venture Capital Analyst.
            Your goal is to analyze a Founder's "Gut Check" statement and translate their qualitative feelings into a quantitative valuation adjustment.

            CONTEXT:
            - Sector: ${context.sector}
            - Region: ${context.region}
            - Base Valuation (approx): $${(context.vcInputs?.exitRevenue * 5 || 5000000).toLocaleString()}

            FOUNDER STATEMENT:
            "${message}"

            INSTRUCTIONS:
            1. Analyze the statement for "Conviction" vs "Delusion" vs "Risk".
            2. Assign a "Conviction Score" from -10 (Major Red Flags) to +10 (Massive Unfair Advantage).
            3. Suggest a "Valuation Adjustment" in USD. 
               - Positive factors (e.g., "Signed contract with Apple", "Ex-Google Team") = +$100k to +$2M.
               - Negative factors (e.g., "Co-founder fighting", "Competitor just raised $100M") = -$100k to -$2M.
            4. Provide a short, punchy reasoning.

            OUTPUT FORMAT (JSON ONLY):
            {
                "convictionScore": number,
                "suggestedAdjustment": number,
                "reasoning": "string"
            }
            `;

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            return NextResponse.json(JSON.parse(result.response.text()));
        }

        // --- MODE: STANDARD CHAT (Default) ---
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
