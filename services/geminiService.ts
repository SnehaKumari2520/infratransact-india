import { GoogleGenAI } from "@google/genai";
import.meta.env.VITE_GEMINI_API_KEY

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URI prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1]; 
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeComplaintImage = async (base64Images: string[], description: string) => {
  const ai = getAiClient();
  if (!ai) return { analysis: "AI Service Unavailable", severity: "Medium" };

  try {
    const prompt = `
      You are an AI assistant for the Indian Ministry of Road Transport and Highways. 
      Analyze these images of infrastructure (road, bridge, etc.) submitted by a citizen along with their description: "${description}".
      
      1. Identify the specific defect (e.g., Pothole, Cracks, Waterlogging, Poor Material).
      2. Estimate the severity (Low, Medium, High, Critical) based on potential for accidents.
      3. Suggest a technical fix.
      
      Return the response in JSON format with keys: "analysis" (string) and "severity" (string).
    `;

    // Create image parts for all uploaded images
    const imageParts = base64Images.map(imgData => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: imgData
      }
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { 
      analysis: "Could not analyze images due to technical error. Please review manually.", 
      severity: "Medium" 
    };
  }
};

export const generateComplianceReport = async (projectData: any) => {
  const ai = getAiClient();
  if (!ai) return "AI Service Unavailable";

  try {
    const prompt = `
      Generate a brief transparency report for this infrastructure project in India. 
      Data: ${JSON.stringify(projectData)}.
      
      Focus on:
      1. Budget utilization (Allocated vs Released).
      2. Gap in progress vs timeline.
      3. Material quality check (if mentioned).
      4. Warning if last update was more than 7 days ago.
      
      Keep it professional, strict, and concise (under 150 words).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "Report generation failed.";
  }
};