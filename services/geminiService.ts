import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a PDF file (as base64) and a prompt to Gemini 2.5 Flash,
 * including previous chat history for context.
 */
export const analyzePdf = async (
  base64Pdf: string,
  prompt: string,
  history: { role: string; text: string }[] = []
) => {
  try {
    const model = 'gemini-2.5-flash';

    const contents = [];

    // 1. If history is empty, this is the first turn. Send PDF + Prompt.
    if (history.length === 0) {
      contents.push({
        role: 'user',
        parts: [
          { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
          { text: prompt }
        ]
      });
    } else {
      // 2. If history exists, we need to reconstruct the conversation.
      // To ensure the model "sees" the PDF in the context, we attach it to the 
      // VERY FIRST user message in the history.
      
      let pdfAttached = false;

      const historyContents = history.map((msg, index) => {
        const parts: any[] = [{ text: msg.text }];
        
        // Attach PDF to the first user message found
        if (!pdfAttached && msg.role === 'user') {
          parts.unshift({ inlineData: { mimeType: "application/pdf", data: base64Pdf } });
          pdfAttached = true;
        }

        return {
          role: msg.role,
          parts: parts
        };
      });

      contents.push(...historyContents);

      // If for some reason no user message was in history (unlikely), 
      // we attach PDF to the current prompt.
      const currentParts: any[] = [{ text: prompt }];
      if (!pdfAttached) {
         currentParts.unshift({ inlineData: { mimeType: "application/pdf", data: base64Pdf } });
      }

      contents.push({
        role: 'user',
        parts: currentParts
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: contents,
      config: {
        systemInstruction: "You are a helpful PDF assistant. Analyze the attached PDF document and answer the user's questions accurately based on its content. Keep answers concise unless asked for detail.",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Rewrites text based on tone and mode using Gemini.
 */
export const rewriteText = async (
  text: string,
  tone: string,
  mode: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Please rewrite the following text.
      
      Requirements:
      - Tone: ${tone}
      - Mode/Length: ${mode}
      - Maintain the original meaning but improve flow and clarity.
      - Return ONLY the rewritten text, no explanations.

      Original Text:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7, 
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error (Rewrite):", error);
    throw error;
  }
};

/**
 * Helper to convert File to Base64 string (stripping the data URL prefix)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove "data:application/pdf;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
