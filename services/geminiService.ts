import { GoogleGenAI, Type } from "@google/genai";
import { ThreatLevel } from "../types";

// NOTE: In a real production build, ensure API_KEY is securely handled.
// The user prompt implies local usage, so we assume process.env.API_KEY is available or injected.
// Since we don't have a backend to proxy this, we initialize client side.
const API_KEY = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

export const initGemini = () => {
  if (API_KEY && !ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
};

export const checkApiKey = () => !!API_KEY;

// Text Analysis
export const analyzeText = async (text: string): Promise<{ level: ThreatLevel, reason: string }> => {
  if (!ai) initGemini();
  if (!ai) throw new Error("AI not initialized");

  const model = "gemini-2.5-flash";
  const prompt = `
    You are the "Safe City" AI analysis system. 
    Analyze the following text for violence or weapon usage in a city environment. 
    Classify into one of three levels:
    - SAFE: Normal conversation, no threats.
    - VIOLENCE: Verbal abuse, physical threats, fighting words.
    - WEAPON: Explicit mention of using guns, knives, bombs, or armed assault.

    Text: "${text}"

    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, enum: [ThreatLevel.SAFE, ThreatLevel.VIOLENCE, ThreatLevel.WEAPON] },
            reason: { type: Type.STRING }
          },
          required: ["level", "reason"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      level: result.level as ThreatLevel,
      reason: result.reason
    };
  } catch (error) {
    console.error("Gemini Text Error", error);
    return { level: ThreatLevel.SAFE, reason: "Analysis failed, defaulting to safe." };
  }
};

// Image/Video Frame Analysis
export const analyzeFrame = async (base64Image: string): Promise<{ level: ThreatLevel, reason: string }> => {
  if (!ai) initGemini();
  if (!ai) throw new Error("AI not initialized");

  // Remove data URL prefix if present for the API call if needed, 
  // but GenAI SDK usually handles inlineData well with pure base64.
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "You are the Safe City visual surveillance AI. Analyze this image frame. Is there visible violence (fighting) or a weapon (gun, knife)? Return JSON with 'level' (SAFE, VIOLENCE, WEAPON) and 'reason'." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, enum: [ThreatLevel.SAFE, ThreatLevel.VIOLENCE, ThreatLevel.WEAPON] },
            reason: { type: Type.STRING }
          },
          required: ["level", "reason"]
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return {
      level: result.level as ThreatLevel,
      reason: result.reason
    };
  } catch (error) {
    console.error("Gemini Vision Error", error);
    return { level: ThreatLevel.SAFE, reason: "Frame analysis failed" };
  }
};

export const explainSafetyLevel = (level: ThreatLevel) => {
  switch (level) {
    case ThreatLevel.SAFE: return "Safe City Status: Normal. No threats detected.";
    case ThreatLevel.VIOLENCE: return "Safe City Alert: Aggressive behavior or physical conflict detected.";
    case ThreatLevel.WEAPON: return "CRITICAL CITY ALERT: Weapon signature identified.";
    default: return "Unknown status.";
  }
};