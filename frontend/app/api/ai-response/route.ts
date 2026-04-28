import { PROMPT } from "@/app/constants/prompt";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const farmerInput = body.query;

    // 🌍 Enforce Delhi as fallback if location is missing
    const city = body.city || "Delhi";
    const state = body.state || "Delhi";

    if (!farmerInput) {
      return NextResponse.json(
        { error: "Farmer input is required" },
        { status: 400 }
      );
    }

    // ✅ Build final prompt
    let finalPrompt = PROMPT.replace("{{farmer_input}}", farmerInput);

    // 📍 Inject constraints AND the "Frontend Crash Prevention" directive
    finalPrompt += `

[SYSTEM CONTEXT & CRITICAL DIRECTIVES]
Farmer location: City: ${city}, State: ${state}

1. RADIUS LIMIT: Restrict all Mandi recommendations strictly within ${city}, ${state} or a max 50km radius.
2. CRITICAL - SCHEMA PRESERVATION: If the user's query is NOT related to agriculture (e.g., jokes, general chat, coding), you MUST STILL RETURN THE EXACT FULL JSON SCHEMA defined in your primary instructions. 
DO NOT return a simplified object. To prevent the frontend from crashing:
- Keep all arrays, nested objects, and keys (like 'options', 'decisionEngine', etc.) exactly as expected by the UI.
- Fill all numeric/price values with 0.
- Place this warning message inside the main text fields (like 'Recommended action', 'reasoning', or 'best mandi name'): "Query outside domain. Please ask about crops."
`;

    const primaryModel = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const fallbackModel = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });

    const generationConfig = {
      temperature: 0.1, 
      topP: 0.9,
      maxOutputTokens: 8192,
    };

    let text = "";

    try {
      // 2️⃣ Attempt 1: Try the stable primary model
      console.log("Attempting generation with gemini-1.5-flash...");
      const result = await primaryModel.generateContent({
        contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        generationConfig,
      });
      text = result.response.text();

    } catch (error: any) {
      console.warn("Primary model failed:", error?.status || error?.message);
      
      // 3️⃣ Catch 503 (Unavailable) or 429 (Too Many Requests)
      if (error?.status === 503 || error?.status === 429 || error?.message?.includes("503")) {
        console.log("Switching to fallback model (gemini-1.5-pro)...");
        try {
          // Attempt 2: Try the heavier fallback model
          const fallbackResult = await fallbackModel.generateContent({
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
            generationConfig,
          });
          text = fallbackResult.response.text();
        } catch (fallbackError) {
          console.error("Fallback model also failed:", fallbackError);
          throw fallbackError; // Both failed, let outer catch handle it
        }
      } else {
        throw error; // Throw other errors (like invalid API keys)
      }
    }
    
    // Extract JSON safely
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.error("JSON parse error:", text);
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    return NextResponse.json({ relevant: true, ...parsed });

  } catch (error) {
    console.error("Fatal AI route error:", error);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}