import { GoogleGenAI, Type } from "@google/genai";
import { WeatherConfig, DEFAULT_CONFIG } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const modelName = 'gemini-2.5-flash';

const weatherSchema = {
  type: Type.OBJECT,
  properties: {
    bgTop: { type: Type.STRING, description: "Top background hex color (e.g. #000000)" },
    bgBottom: { type: Type.STRING, description: "Bottom background hex color" },
    cloudDensity: { type: Type.NUMBER, description: "0.0 to 1.0" },
    cloudSpeed: { type: Type.NUMBER, description: "0.0 to 2.0" },
    cloudColor: { type: Type.STRING, description: "Cloud hex color" },
    cloudOpacity: { type: Type.NUMBER, description: "0.0 to 1.0" },
    rainIntensity: { type: Type.NUMBER, description: "0.0 to 1.0" },
    snowIntensity: { type: Type.NUMBER, description: "0.0 to 1.0" },
    windAngle: { type: Type.NUMBER, description: "Wind angle in degrees" },
    sunPositionX: { type: Type.NUMBER, description: "-1.0 to 1.0" },
    sunPositionY: { type: Type.NUMBER, description: "-1.0 to 1.0" },
    sunColor: { type: Type.STRING, description: "Sun/Moon hex color" },
    sunScale: { type: Type.NUMBER, description: "Size of sun/moon" },
    conditionLabel: { type: Type.STRING, description: "Short description of weather" },
    temperature: { type: Type.NUMBER, description: "Temperature in Fahrenheit" },
  },
  required: ["bgTop", "bgBottom", "conditionLabel"],
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateWeatherFromPrompt = async (prompt: string): Promise<WeatherConfig> => {
  let retries = 3;
  let delay = 1000;

  while (true) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Generate a weather configuration for this description: "${prompt}". Make sure it looks aesthetically pleasing and matches the mood.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: weatherSchema,
        },
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        // Merge with default to ensure all fields exist if AI misses some
        return { ...DEFAULT_CONFIG, ...data };
      }
      return DEFAULT_CONFIG;
    } catch (error: any) {
      // Check for 429 (Too Many Requests / Quota Exceeded) or 503 (Service Unavailable)
      const isRateLimit = error.status === 429 || 
                         (error.message && error.message.includes('429')) ||
                         (error.message && error.message.includes('Quota exceeded'));
      
      if (isRateLimit && retries > 0) {
        console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
        await wait(delay);
        retries--;
        delay *= 2; // Exponential backoff
        continue;
      }
      
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
};