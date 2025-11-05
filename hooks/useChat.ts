import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, User } from '../types';
import { geminiService } from '../backend/geminiService';
import { db } from '../backend/firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';


export const useChat = (user: User | null) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchConversations = async () => {
                setIsLoading(true);
                try {
                    const q = query(
                        collection(db, "conversations"),
                        where("userId", "==", user.uid),
                        orderBy("createdAt", "desc")
                    );
                    const querySnapshot = await getDocs(q);
                    const convos: Conversation[] = [];
                    for (const doc of querySnapshot.docs) {
                        const convoData = doc.data();
                        const messagesQuery = query(
                            collection(db, "conversations", doc.id, "messages"),
                            orderBy("timestamp", "asc")
                        );
                        const messagesSnapshot = await getDocs(messagesQuery);
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
            // This is a new chat
            const tempId = `temp-${Date.now()}`;
            const newConversation: Conversation = {
                id: tempId,
                title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
                messages: [userMessage],
                createdAt: new Date().toISOString(),
            };
            setConversations(prev => [newConversation, ...prev]);
            setActiveConversationId(tempId);
            currentConvoId = tempId; // Use tempId for the rest of the function
        } else {
             setConversations(prev => prev.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, userMessage] } : c));
        }


        try {
            // If it was a new chat, create it in Firebase now
            if (activeConversationId?.startsWith('temp-')) {
                const newConvoRef = await addDoc(collection(db, "conversations"), {
                    userId: user.uid,
                    title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
                    createdAt: new Date().toISOString(),
                });
                const realId = newConvoRef.id;
                
                // Update conversation state with the real ID from Firebase
                setConversations(prev => prev.map(c => c.id === activeConversationId ? {...c, id: realId} : c));
                setActiveConversationId(realId);
                currentConvoId = realId;
            }

            const { id: tempUserMsgId, ...userMessageData } = userMessage;
            await addDoc(collection(db, "conversations", currentConvoId!, "messages"), userMessageData);

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
                await addDoc(collection(db, "conversations", currentConvoId!, "messages"), modelResponseData);
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
                
                // FIX: Corrected typo from newtoISOString() to new Date().toISOString().
                const finalModelMessage: Message = { id: modelResponseId, role: 'model', content: fullText, timestamp: new Date().toISOString() };
                const { id: tempModelId, ...modelResponseData } = finalModelMessage;
                await addDoc(collection(db, "conversations", currentConvoId!, "messages"), modelResponseData);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: `msg-error-${Date.now()}`,
                role: 'model',
                content: error instanceof Error ? `Error: ${error.message}` : 'Sorry, an unexpected error occurred.',
                timestamp: new Date().toISOString(),
            };
            if(currentConvoId) {
                // Add the error message to the conversation without removing the user's message.
                setConversations(prev => prev.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, errorMessage] } : c));
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
    };
};