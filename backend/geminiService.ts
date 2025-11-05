import { Message } from '../types';

// This file acts as a client-side layer to communicate with our secure backend function.
// It sends requests to `/api/gemini` and handles the responses.

async function* generateTextStream(history: Message[], newMessage: string): AsyncGenerator<string> {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'text',
            history,
            newMessage,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate text and parse error response.' }));
        throw new Error(errorData.message || 'An unknown error occurred during text generation.');
    }
    
    if (!response.body) {
        throw new Error("Response from server contained no body.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        yield decoder.decode(value, { stream: true });
    }
}

async function generateImage(prompt: string): Promise<string> {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'image',
            prompt,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate image and parse error response.' }));
        throw new Error(errorData.message || 'An unknown error occurred during image generation.');
    }
    
    const data = await response.json();
    if (!data.imageUrl) {
        throw new Error('Backend did not return an image URL.');
    }
    
    return data.imageUrl;
}

export const geminiService = {
  generateTextStream,
  generateImage,
};
