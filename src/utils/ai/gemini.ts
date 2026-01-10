import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface GeneratedMarketData {
    title: string;
    description: string;
    category: string;
    endDate: string;
}

export const generateMarketData = async (prompt: string): Promise<GeneratedMarketData> => {
    if (!API_KEY) {
        throw new Error("Missing VITE_GEMINI_API_KEY in .env");
    }

    // Initialize these BEFORE the loop
    const genAI = new GoogleGenerativeAI(API_KEY);

    const systemPrompt = `
    You are an expert Prediction Market Architect.
    Your goal is to convert a user's vague idea into a fun, clear, and bet-able market.
    
    Output JSON ONLY. Format:
    {
      "title": "Clear, objective Yes/No question. Must be short and punchy.",
      "description": "Extremely concise. Just state the event being predicted in 1 sentence. Do NOT use phrases like 'This market resolves to YES if'. Do NOT add flavor text or jokes. Just the facts.",
      "category": "One of: Crypto, Sports, Politics, Pop Culture, Business, Science, Custom. Choose the best fit.",
      "endDate": "ISO 8601 Date string (e.g. 2024-12-31T23:59:59). Choose a logical timeframe relative to now (assume now is ${new Date().toISOString()})."
    }

    User Idea: "${prompt}"
  `;

    // Strategy: Try newer models first, fall back to older ones if 404/Found
    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite"
    ];

    let lastError;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting to generate with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();
            // console.log(`AI Response (Success with ${modelName}):`, text);

            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(jsonStr);
            } catch (parseError) {
                console.error(`JSON Parse Error with model ${modelName}:`, text);
                continue;
            }
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;

            if (error.message?.includes("API_KEY") || error.message?.includes("403")) {
                throw new Error("Invalid/Unauthorized API Key. Check .env file.");
            }
        }
    }

    console.error("All AI models failed.");
    throw new Error(lastError?.message || "Failed to connect to AI (All models failed).");
};

export interface MarketAnalysis {
    sentimentScore: number; // 0-100
    bullishArgs: string[];
    bearishArgs: string[];
    summary: string;
}

export const generateMarketAnalysis = async (title: string, description: string): Promise<MarketAnalysis> => {
    if (!API_KEY) {
        throw new Error("Missing VITE_GEMINI_API_KEY in .env");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    const systemPrompt = `
    You are a professional Financial & Political Analyst for a prediction market platform.
    Analyze the following market and provide objective research to help users decide how to bet.
    
    Market Title: "${title}"
    Market Description: "${description}"

    Provide:
    1. Sentiment Score (0-100): 
       - 0 = Extremely Unlikely the event happens (NO).
       - 100 = Extremely Likely the event happens (YES).
       - 50 = Complete toss-up / Unknown.
    2. Bull Case (Why YES might happen): 2 strongest arguments. Max 5-8 words per argument. Keep it punchy.
    3. Bear Case (Why NO might happen): 2 strongest arguments. Max 5-8 words per argument. Keep it punchy.
    4. Summary: 1 concise sentence context.

    Output JSON ONLY. Format:
    {
      "sentimentScore": 65,
      "bullishArgs": ["Arg 1", "Arg 2"],
      "bearishArgs": ["Arg 1", "Arg 2"],
      "summary": "Context string."
    }
  `;

    // Re-use same robust model list
    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-1.5-flash",
        "gemini-pro"
    ];

    let lastError;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(systemPrompt);
            const text = result.response.text();

            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonStr);

            // Validate basic structure
            if (typeof data.sentimentScore !== 'number' || !Array.isArray(data.bullishArgs)) {
                throw new Error("Invalid structure");
            }

            return data;
        } catch (error: any) {
            console.warn(`Analysis Model ${modelName} failed:`, error.message);
            lastError = error;
            if (error.message?.includes("API_KEY") || error.message?.includes("403")) throw error;
        }
    }

    throw new Error("Failed to generate analysis.");
};

export interface OracleResolution {
    outcome: 'YES' | 'NO' | 'UNCERTAIN';
    confidence: number; // 0-100
    reasoning: string;
}

export const getOracleResolution = async (title: string, description: string): Promise<OracleResolution> => {
    if (!API_KEY) throw new Error("Missing API Key");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const today = new Date().toISOString();

    const systemPrompt = `
    You are an Impartial Judge and Fact Checker for a prediction market.
    Your job is to determine if the following event has unambiguously occurred.
    
    Current Date: ${today}
    
    Market: "${title}"
    Details: "${description}"

    Task:
    1. Search your knowledge base for real-world confirmation of this event.
    2. If the event is in the future relative to Current Date, output "UNCERTAIN" (Reason: "Event date is in the future").
    3. If the event hasn't happened yet but the deadline passed, output "NO".
    4. If the event DEFINITELY happened, output "YES".

    Output JSON ONLY:
    {
      "outcome": "YES" | "NO" | "UNCERTAIN",
      "confidence": 95,
      "reasoning": "Short explanation citing dates/facts."
    }
    `;

    // Use Flash model for speed/reasoning
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        throw new Error("Oracle failed to consult the spirits.");
    }
};
