import { PROMPT } from "@/app/constants/prompt";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 🌾 Agriculture-related keywords for validation
const AGRICULTURE_KEYWORDS = [
  // Crops & Plants
  "crop", "crops", "plant", "plants", "seed", "seeds", "harvest", "harvesting",
  "sow", "sowing", "cultivate", "cultivation", "grow", "growing", "yield",
  "paddy", "wheat", "rice", "maize", "corn", "sugarcane", "cotton", "soybean",
  "mustard", "sunflower", "groundnut", "potato", "tomato", "onion", "garlic",
  "vegetable", "vegetables", "fruit", "fruits", "pulse", "pulses", "lentil",
  "chickpea", "dal", "gram", "millet", "sorghum", "barley", "turmeric",
  "ginger", "chilli", "pepper", "brinjal", "cabbage", "cauliflower", "spinach",

  // Farming Activities
  "farm", "farming", "farmer", "field", "soil", "land", "irrigation",
  "fertilizer", "fertiliser", "pesticide", "insecticide", "herbicide",
  "manure", "compost", "mulching", "pruning", "tilling", "ploughing",
  "plowing", "weeding", "transplant", "nursery", "greenhouse",

  // Weather & Season
  "rain", "rainfall", "monsoon", "drought", "season", "rabi", "kharif",
  "zaid", "summer crop", "winter crop",

  // Market & Finance
  "mandi", "market", "price", "rate", "sell", "selling", "buyer", "profit",
  "loss", "subsidy", "loan", "insurance", "msp", "minimum support price",

  // Pest & Disease
  "pest", "disease", "fungus", "blight", "rot", "wilt", "aphid", "locust",
  "infestation", "spray", "treatment", "cure",

  // Soil & Water
  "water", "groundwater", "drip", "sprinkler", "borewell", "canal",
  "ph", "nitrogen", "phosphorus", "potassium", "nutrient", "organic",
];

function isAgricultureRelated(input: string): boolean {
  const lower = input.toLowerCase();
  return AGRICULTURE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

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

    // 🚫 Early Exit: Check if query has basic keywords
    if (!isAgricultureRelated(farmerInput)) {
      return NextResponse.json({
        relevant: false,
        message:
          "This query is outside my domain. I am exclusively designed for Crop Analysis and Mandi Price recommendations. Please ask about your harvest, crop prices, or nearby mandis.",
        suggestions: [
          "50 quintal wheat harvest in 10 days",
          "Which mandi is giving the best price for soybean today?",
          "What is the current rate for mustard in Delhi?",
        ],
      });
    }

    // ✅ Build final prompt
    let finalPrompt = PROMPT.replace("{{farmer_input}}", farmerInput);

    // 📍 Inject strict domain and location constraints
    finalPrompt += `

[SYSTEM CONTEXT]
Farmer location:
City: ${city}
State: ${state}

CRITICAL DIRECTIVES:
1. STRICT DOMAIN LOCK: You are an AI restricted ONLY to Crop Analysis, Harvest Estimation, and Mandi/Market Price Analysis. If the user's intent is a joke, general conversation, coding, or unrelated agriculture topics (e.g., buying tractors), you MUST return a JSON object with {"relevant": false, "message": "I can only assist with crop analysis and mandi recommendations."} and omit all other data.
2. RADIUS LIMIT: You MUST restrict all Mandi recommendations strictly within ${city}, ${state} or a maximum 50km radius.
3. NO DISTANT MANDIS: Absolutely do NOT suggest mandis from other states or distant regions (e.g., do not suggest MP mandis if the user is in Delhi).
4. EXACT COUNT: Return exactly the top 3 closest and most profitable mandis for the requested crop within this specific local region.
5. REALISTIC DISTANCE: Ensure the estimated distance (km away) is realistic relative to the provided City center.
If the user explicitly mentions a different location in their query, override the City/State, but still apply the 50km radius rule to their newly requested location.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    
    console.log("hello");
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: finalPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2, // Lower temperature keeps it factual and obedient to the domain lock
        topP: 0.9,
        maxOutputTokens: 8192,
      },
    });
    console.log('jello');
    
    const text = result.response.text();
    
    // Extract JSON from response if wrapped in markdown code blocks
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
        { error: "Invalid AI response format", raw: text.substring(0, 500) },
        { status: 500 }
      );
    }

    return NextResponse.json({ relevant: true, ...parsed });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}