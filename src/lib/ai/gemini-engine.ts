import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  // In AI Studio Build, GEMINI_API_KEY is available in the environment
  return process.env.GEMINI_API_KEY || "";
};

const genAI = new GoogleGenerativeAI(getApiKey());

export class BrandavoxAI {
  static async generateContent(prompt: string, modelType: "flash" | "pro" = "flash") {
    try {
      const modelName = modelType === "pro" ? "gemini-2.0-pro-exp-02-05" : "gemini-2.0-flash";
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Attempt to parse JSON if requested in prompt
      if (prompt.toLowerCase().includes("json")) {
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.warn("JSON Parse Error in Gemini output, returning raw text", e);
        }
      }
      return text;
    } catch (error) {
      console.error("Gemini Engine Error:", error);
      throw new Error("Neural Engine Failure: Gemini could not process the request.");
    }
  }

  static async generateImageBlueprint(prompt: string) {
    const blueprintPrompt = `Create a professional visual strategy for: "${prompt}". 
    Return a STRICT JSON object with: 
    - keywords: string[] (3 specific visual keywords)
    - composition: string (professional camera angle)
    - lighting: string (lighting style)
    - description: string (evocative 1-sentence mood description)`;
    
    return this.generateContent(blueprintPrompt, "flash");
  }
}
