import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export interface ConsultantResponse {
  advice: string;
  recommendations: {
    title: string;
    description: string;
    prompt: string;
    shoppingLinks: { label: string; url: string }[];
  }[];
}

export const getFashionAdvice = async (prompt: string): Promise<ConsultantResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are StyleSense, a world-class fashion consultant. Provide chic, trend-aware advice. If the user is looking for outfit ideas, provide 2-3 structured recommendations. Return the response in JSON format.",
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          advice: { type: Type.STRING, description: "The conversational styling advice in markdown." },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                prompt: { type: Type.STRING },
                shoppingLinks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { label: { type: Type.STRING }, url: { type: Type.STRING } },
                    required: ["label", "url"]
                  }
                }
              },
              required: ["title", "description", "prompt", "shoppingLinks"]
            }
          }
        },
        required: ["advice", "recommendations"]
      }
    },
  });

  try {
    return JSON.parse(response.text || "{}") as ConsultantResponse;
  } catch (e) {
    return {
      advice: response.text || "I'm sorry, I couldn't generate advice at the moment.",
      recommendations: []
    };
  }
};

export interface StyleAnalysis {
  extractedFeatures: {
    colors: string[];
    patterns: string[];
    style: string;
    occasion: string;
  };
  analysis: string;
  recommendations: {
    title: string;
    description: string;
    prompt: string;
    shoppingLinks: { label: string; url: string }[];
  }[];
}

export const analyzeStyle = async (base64Image: string, mimeType: string): Promise<StyleAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Perform a deep fashion analysis. 1. Extract features: primary colors, patterns, overall style category, and likely occasion. 2. Provide a detailed styling analysis. 3. Suggest 3 related outfits with visual prompts and shopping links." }
      ]
    },
    config: {
      systemInstruction: "You are StyleSense AI, a high-end fashion intelligence system. Analyze images with computer vision precision. Return the response in strict JSON format.",
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedFeatures: {
            type: Type.OBJECT,
            properties: {
              colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
              style: { type: Type.STRING },
              occasion: { type: Type.STRING }
            },
            required: ["colors", "patterns", "style", "occasion"]
          },
          analysis: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                prompt: { type: Type.STRING },
                shoppingLinks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { label: { type: Type.STRING }, url: { type: Type.STRING } },
                    required: ["label", "url"]
                  }
                }
              },
              required: ["title", "description", "prompt", "shoppingLinks"]
            }
          }
        },
        required: ["extractedFeatures", "analysis", "recommendations"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as StyleAnalysis;
  } catch (e) {
    console.error("Failed to parse analysis:", e);
    throw new Error("Analysis failed");
  }
};

export const generateOutfitSketch = async (description: string): Promise<string | null> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: `A high-fashion editorial outfit sketch or concept: ${description}. Professional lighting, chic aesthetic.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};
