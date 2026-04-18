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

export async function cloneWebsite(url: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Act as a Neural Scraper. Generate a professional HTML structure and a Python automation script for the following URL: ${url}. 
      Format as JSON: { "html": "...", "python": "..." }. Keep it concise but sovereign.`,
    });
    const text = response.text || '{ "html": "", "python": "" }';
    // Basic extraction if it's wrapped in markdown
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    return { html: "<!-- Error cloning -->", python: "# Error cloning" };
  }
}

export async function getCloneSuggestions(url: string, content: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `This content was cloned from ${url}. Suggest 3 sovereign improvements to optimize this code for the QAMANI empire:\n\n${content}`,
    });
    return response.text || "No suggestions available.";
  } catch (error) {
    return "Error generating suggestions.";
  }
}
