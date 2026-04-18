import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function debugCode(code: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze this Python code for bugs and suggest improvements. Keep it concise:\n\n${code}`,
    });
    return response.text || "No analysis provided.";
  } catch (error) {
    console.error("Debug error:", error);
    return "Could not analyze code.";
  }
}
