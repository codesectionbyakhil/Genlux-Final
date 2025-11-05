import { GoogleGenAI } from "@google/genai";

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';

export const onRequestPost = async (context) => {
    try {
        const { request, env } = context;

        const API_KEY = env.API_KEY;
        if (!API_KEY) {
            const errorMessage = "API_KEY is not set. Please configure your environment variables in your deployment settings.";
            return new Response(JSON.stringify({ message: errorMessage }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        
        const body = await request.json();
        const { type } = body;

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        if (type === 'text') {
            const { history, newMessage } = body;
            const chat = ai.chats.create({
                model: textModel,
                history: history.map(msg => ({
                  role: msg.role,
                  parts: [{ text: msg.content }],
                })),
            });
            const result = await chat.sendMessageStream({ message: newMessage });
            
            const stream = new ReadableStream({
                async start(controller) {
                    for await (const chunk of result) {
                        const text = chunk.text;
                        if (text) { // Ensure we don't send empty chunks
                            controller.enqueue(new TextEncoder().encode(text));
                        }
                    }
                    controller.close();
                },
            });

            return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        } else if (type === 'image') {
            const { prompt } = body;
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
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                return new Response(JSON.stringify({ imageUrl }), { headers: { 'Content-Type': 'application/json' } });
            } else {
                throw new Error("Image generation failed, no image returned from API.");
            }
        } else {
            return new Response(JSON.stringify({ message: "Invalid request type" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

    } catch (error) {
        console.error("Error in Gemini API function:", error);
        return new Response(JSON.stringify({ message: error instanceof Error ? error.message : "An internal server error occurred." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};