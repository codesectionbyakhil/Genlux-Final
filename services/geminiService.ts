import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

// Lazily creates the AI client to avoid crashing the app if the API key is missing on load.
// An error will be thrown during the API call instead, which can be caught by the UI.
const getAiClient = () => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY is not set. Please configure your environment variables.");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';

async function* generateTextStream(history: Message[], newMessage: string): AsyncGenerator<string> {
  const ai = getAiClient();
  const chat = ai.chats.create({
    model: textModel,
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })),
  });

  const result = await chat.sendMessageStream({ message: newMessage });

  for await (const chunk of result) {
    yield chunk.text;
  }
}

async function generateImage(prompt: string): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: imageModel,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    
    throw new Error('Image generation failed.');
}

export const geminiService = {
  generateTextStream,
  generateImage,
};