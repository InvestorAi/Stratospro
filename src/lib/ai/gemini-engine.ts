import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export class BrandavoxAI {
  static async generateContent(prompt: string | any[], modelType: "flash" | "pro" | "flash-lite" = "flash") {
    try {
      const modelName = modelType === "pro" ? "gemini-3.1-pro-preview" : 
                       modelType === "flash-lite" ? "gemini-3.1-flash-lite" :
                       "gemini-3-flash-preview";
      
      const isJson = typeof prompt === 'string' && prompt.toLowerCase().includes("json");
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: typeof prompt === 'string' ? prompt : { parts: prompt },
        config: {
          responseMimeType: isJson ? "application/json" : "text/plain"
        }
      });

      const text = response.text;

      if (isJson) {
        try {
          return JSON.parse(text);
        } catch (e) {
          const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              return JSON.parse(jsonMatch[0]);
            } catch (e2) {
              return { error: "Malformed JSON response", raw: text };
            }
          }
          return { error: "No JSON found in response", raw: text };
        }
      }
      return text;
    } catch (error) {
      console.error("Gemini Engine Error:", error);
      throw error;
    }
  }

  static async generateContentStream(prompt: string | any[], onChunk: (text: string) => void, modelType: "flash" | "pro" = "flash") {
    try {
      const modelName = modelType === "pro" ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
      
      const response = await ai.models.generateContentStream({
        model: modelName,
        contents: typeof prompt === 'string' ? prompt : { parts: prompt },
      });

      let fullText = "";
      for await (const chunk of response) {
        const chunkText = chunk.text;
        fullText += chunkText;
        onChunk(fullText);
      }
      return fullText;
    } catch (error) {
      console.error("Gemini Engine Stream Error:", error);
      throw error;
    }
  }

  static async generateImageBlueprint(prompt: string, onChunk?: (text: string) => void) {
    const blueprintPrompt = `Create a professional, high-fidelity visual strategy for: "${prompt}". 
    Return a STRICT JSON object with: 
    - keywords: string[] (3 unique, visually descriptive technical keywords)
    - composition: string
    - lighting: string
    - description: string`;
    
    if (onChunk) {
      return this.generateContentStream(blueprintPrompt, onChunk, "flash");
    }
    return this.generateContent(blueprintPrompt, "flash");
  }

  static async generateVideoBlueprint(prompt: string, onChunk?: (text: string) => void) {
    if (onChunk) {
      return this.generateContentStream(prompt, onChunk, "flash");
    }
    return this.generateContent(prompt, "flash");
  }
}
