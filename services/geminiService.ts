import { GoogleGenAI } from "@google/genai";

// @ts-ignore
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const getAiClient = () => {
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing from environment variables.");
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
    const promptText = `
      You are an AI assistant for the Indian Ministry of Road Transport and Highways. 
      Analyze these images of infrastructure (road, bridge, etc.) submitted by a citizen along with their description: "${description}".
      
      1. Identify the specific defect (e.g., Pothole, Cracks, Waterlogging, Poor Material).
      2. Estimate the severity (Low, Medium, High, Critical) based on potential for accidents.
      3. Suggest a technical fix.
      
      Return the response in JSON format with keys: "analysis" (string) and "severity" (string).
    `;

    // Map properly to the expected Part structure for inline image uploads
    const imageParts = base64Images.map(imgData => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: imgData
      }
    }));

    // Fixed model instantiation matching the new SDK standards
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...imageParts,
        { text: promptText }
      ],
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
    const promptText = `
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
      contents: promptText,
    });

    return response.text || "No report content generated.";
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "Report generation failed.";
  }
};