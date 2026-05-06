/**
 * Brandavox AI Service Class
 * Interfaces with the backend proxy to use DeepSeek-V3 and DeepSeek-VL
 */
export class BrandavoxAI {
  private static async postProxy(endpoint: string, data: any) {
    const response = await fetch(`/api/proxy/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'DeepSeek Engine failure');
    }

    return response.json();
  }

  static async generateContent(prompt: string, model: string = "deepseek-chat") {
    const result = await this.postProxy('deepseek', {
      model,
      messages: [
        { role: "system", content: "You are the Brandavox Strategic Engine. Output only JSON." },
        { role: "user", content: prompt }
      ]
    });
    
    return JSON.parse(result.content);
  }

  static async generateImageBlueprint(prompt: string) {
    return this.generateContent(
      `Generate a technical 8K image blueprint for: "${prompt}". 
      Return JSON with: keywords (array), lighting, composition, lens, and description.`,
      "deepseek-reasoner" // Using DeepSeek-Reasoner for complex blueprints
    );
  }
}
