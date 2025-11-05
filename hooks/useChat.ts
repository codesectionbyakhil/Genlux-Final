import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, User } from '../types';
import { geminiService } from '../backend/geminiService';
import { db } from '../backend/firebase';

export const useChat = (user: User | null) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchConversations = async () => {
                setIsLoading(true);
                try {
                    const q = db.collection("conversations")
                        .where("userId", "==", user.uid)
                        .orderBy("createdAt", "desc");
                    
                    const querySnapshot = await q.get();
                    const convos: Conversation[] = [];
                    for (const doc of querySnapshot.docs) {
                        const convoData = doc.data();
                        const messagesQuery = db.collection("conversations").doc(doc.id).collection("messages")
                            .orderBy("timestamp", "asc");
                        
                        const messagesSnapshot = await messagesQuery.get();
                        const messages = messagesSnapshot.docs.map(msgDoc => ({ id: msgDoc.id, ...msgDoc.data() } as Message));
                        
                        convos.push({
                            id: doc.id,
                            title: convoData.title,
                            createdAt: convoData.createdAt,
                            messages: messages,
                        });
                    }
                    setConversations(convos);
                } catch (error) {
                    console.error("Error fetching conversations:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchConversations();
        } else {
            setConversations([]);
            setActiveConversationId(null);
        }
    }, [user]);

    const startNewChat = useCallback(() => {
        setActiveConversationId(null);
    }, []);
    
    const clearApiKeyMissingError = useCallback(() => setIsApiKeyMissing(false), []);

    const sendMessage = useCallback(async (content: string) => {
        if (!user) return;
    
        const userMessage: Message = {
            id: `msg-user-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        };
    
        let currentConvoId = activeConversationId;
        
        setIsLoading(true);

        // Optimistically update UI with user's message
        if (!currentConvoId) {
            const tempId = `temp-${Date.now()}`;
            const newConversation: Conversation = {
                id: tempId,
                title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
                messages: [userMessage],
                createdAt: new Date().toISOString(),
            };
            setConversations(prev => [newConversation, ...prev]);
            setActiveConversationId(tempId);
            currentConvoId = tempId;
        } else {
             setConversations(prev => prev.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, userMessage] } : c));
        }


        try {
            if (activeConversationId?.startsWith('temp-')) {
                const newConvoRef = await db.collection("conversations").add({
                    userId: user.uid,
                    title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
                    createdAt: new Date().toISOString(),
                });
                const realId = newConvoRef.id;
                
                setConversations(prev => prev.map(c => c.id === activeConversationId ? {...c, id: realId} : c));
                setActiveConversationId(realId);
                currentConvoId = realId;
            }

            const { id: tempUserMsgId, ...userMessageData } = userMessage;
            await db.collection("conversations").doc(currentConvoId!).collection("messages").add(userMessageData);

            const modelResponseId = `msg-model-${Date.now()}`;

            if (content.toLowerCase().startsWith('/imagine')) {
                 const imageUrl = await geminiService.generateImage(content.substring(8).trim());
                 const modelResponseMessage: Message = {
                    id: modelResponseId,
                    role: 'model',
                    content: "",
                    image: imageUrl,
                    timestamp: new Date().toISOString(),
                };
                
                const { id: tempModelId, ...modelResponseData } = modelResponseMessage;
                await db.collection("conversations").doc(currentConvoId!).collection("messages").add(modelResponseData);
                setConversations(prev => prev.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, modelResponseMessage] } : c));

            } else {
                const history = conversations.find(c => c.id === currentConvoId)?.messages.filter(m => !m.image) || [];
                const stream = geminiService.generateTextStream(history, content);
                let fullText = '';
                let isFirstChunk = true;

                for await (const chunk of stream) {
                    fullText += chunk;
                    if (isFirstChunk) {
                        isFirstChunk = false;
                        const streamingMessage: Message = { id: modelResponseId, role: 'model', content: fullText, timestamp: new Date().toISOString() };
                        setConversations(prev => prev.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, streamingMessage] } : c));
                    } else {
                        setConversations(prev => prev.map(c => {
                            if (c.id === currentConvoId) {
                                const updatedMessages = c.messages.map(m => m.id === modelResponseId ? { ...m, content: fullText } : m);
                                return { ...c, messages: updatedMessages };
                            }
                            return c;
                        }));
                    }
                }
                
                const finalModelMessage: Message = { id: modelResponseId, role: 'model', content: fullText, timestamp: new Date().toISOString() };
                const { id: tempModelId, ...modelResponseData } = finalModelMessage;
                await db.collection("conversations").doc(currentConvoId!).collection("messages").add(modelResponseData);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const isApiKeyError = error instanceof Error && error.message.includes("API_KEY is not set");

            // Revert the optimistic user message on any error.
            if (activeConversationId?.startsWith('temp-')) {
                setConversations(prev => prev.filter(c => c.id !== activeConversationId));
                setActiveConversationId(null);
            } else if (currentConvoId) {
                setConversations(prev => prev.map(c => 
                    c.id === currentConvoId 
                    ? { ...c, messages: c.messages.slice(0, -1) } 
                    : c
                ));
            }

            if (isApiKeyError) {
                setIsApiKeyMissing(true);
            } else {
                // For other errors, add an error bubble to existing conversations AFTER reverting.
                if (currentConvoId && !currentConvoId.startsWith('temp-')) {
                    const errorMessage: Message = {
                        id: `msg-error-${Date.now()}`,
                        role: 'model',
                        content: error instanceof Error ? `Error: ${error.message}` : 'Sorry, an unexpected error occurred.',
                        timestamp: new Date().toISOString(),
                    };
                    setConversations(prev => prev.map(c => 
                        c.id === currentConvoId 
                        ? { ...c, messages: [...c.messages, errorMessage] } 
                        : c
                    ));
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, [user, conversations, activeConversationId]);

    const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

    return {
        conversations,
        activeConversation,
        sendMessage,
        startNewChat,
        setActiveConversationId,
        isLoading,
        isApiKeyMissing,
        clearApiKeyMissingError,
    };
};