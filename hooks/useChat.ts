import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, User } from '../types';
import { geminiService } from '../backend/geminiService';

const getInitialConversations = (user: User | null): Conversation[] => {
    if (!user) return [];
    const key = `genlux_ai_conversations_${user.email}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

export const useChat = (user: User | null) => {
    const [conversations, setConversations] = useState<Conversation[]>(() => getInitialConversations(user));
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const userConversations = getInitialConversations(user);
            setConversations(userConversations);
            setActiveConversationId(null);
        } else {
            setConversations([]);
            setActiveConversationId(null);
        }
    }, [user]);

    useEffect(() => {
        if (user && conversations.length > 0) {
            const key = `genlux_ai_conversations_${user.email}`;
            localStorage.setItem(key, JSON.stringify(conversations));
        }
    }, [conversations, user]);

    const startNewChat = useCallback(() => {
        setActiveConversationId(null);
    }, []);

    const createNewConversation = useCallback((firstMessage: Message) => {
        const newConversation: Conversation = {
            id: `convo-${Date.now()}`,
            title: firstMessage.content.substring(0, 30) + '...',
            messages: [firstMessage],
            createdAt: new Date().toISOString(),
        };
        setConversations(prev => [...prev, newConversation]);
        setActiveConversationId(newConversation.id);
        return newConversation;
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!user) return;
    
        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        };
    
        let currentConvo = conversations.find(c => c.id === activeConversationId);
        if (!currentConvo) {
            currentConvo = createNewConversation(userMessage);
        } else {
            currentConvo = { ...currentConvo, messages: [...currentConvo.messages, userMessage] };
            setConversations(prev => prev.map(c => c.id === activeConversationId ? currentConvo! : c));
        }

        setIsLoading(true);
        let modelResponseId: string | null = null;

        try {
            if (content.toLowerCase().startsWith('/imagine')) {
                 const modelResponse: Message = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'model',
                    content: `Generating image for: ${content.substring(8)}`,
                    image: '',
                    timestamp: new Date().toISOString(),
                };
                modelResponseId = modelResponse.id;

                setConversations(prev => prev.map(c => c.id === currentConvo!.id ? { ...c, messages: [...c.messages, modelResponse] } : c));
                
                const imageUrl = await geminiService.generateImage(content.substring(8));
                const finalModelMessage = { ...modelResponse, image: imageUrl, content: "" };

                setConversations(prev => prev.map(c => c.id === currentConvo!.id ? { ...c, messages: c.messages.map(m => m.id === modelResponse.id ? finalModelMessage : m) } : c));

            } else {
                const modelResponse: Message = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'model',
                    content: '',
                    timestamp: new Date().toISOString(),
                };
                modelResponseId = modelResponse.id;

                setConversations(prev => prev.map(c => c.id === currentConvo!.id ? { ...c, messages: [...c.messages, modelResponse] } : c));

                const stream = geminiService.generateTextStream(currentConvo.messages, content);
                let fullText = '';
                for await (const chunk of stream) {
                    fullText += chunk;
                    setConversations(prev => prev.map(c => {
                        if (c.id === currentConvo!.id) {
                            const newMessages = c.messages.map(m => m.id === modelResponse.id ? { ...m, content: fullText } : m);
                            return { ...c, messages: newMessages };
                        }
                        return c;
                    }));
                }
            }
        } catch (error) {
            console.error("Error communicating with Gemini API:", error);
            const errorMessageText = error instanceof Error ? `Error: ${error.message}` : 'Sorry, I encountered an unknown error. Please try again.';
            
            setConversations(prev => prev.map(c => {
                if (c.id === currentConvo!.id) {
                    if (modelResponseId) {
                        // Replace the placeholder with an error message
                        const newMessages = c.messages.map(m => 
                            m.id === modelResponseId ? { ...m, content: errorMessageText, image: undefined } : m
                        );
                        return { ...c, messages: newMessages };
                    } else {
                        // Fallback: If no placeholder, just add the error message
                        const errorMessage: Message = {
                            id: `msg-error-${Date.now()}`,
                            role: 'model',
                            content: errorMessageText,
                            timestamp: new Date().toISOString(),
                        };
                        return { ...c, messages: [...c.messages, errorMessage] };
                    }
                }
                return c;
            }));
        } finally {
            setIsLoading(false);
        }
    }, [user, conversations, activeConversationId, createNewConversation]);

    const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

    return {
        conversations,
        activeConversation,
        sendMessage,
        startNewChat,
        setActiveConversationId,
        isLoading,
    };
};