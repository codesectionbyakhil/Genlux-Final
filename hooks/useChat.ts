
import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, User } from '../types';
import { geminiService } from '../backend/geminiService';
import { db } from '../backend/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, doc, setDoc } from 'firebase/firestore';


export const useChat = (user: User | null) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            const fetchConversations = async () => {
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
            id: `msg-${Date.now()}`, // Temporary client-side ID
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        };
    
        let currentConvoId = activeConversationId;
        
        // Optimistically update UI
        if (currentConvoId) {
            setConversations(prev => prev.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, userMessage] } : c));
        } else {
            // It's a new chat, but we don't know the ID yet. We'll handle this after creating it.
        }

        setIsLoading(true);

        try {
            // If it is a new conversation, create it in Firestore first
            if (!currentConvoId) {
                const newConvoRef = await addDoc(collection(db, "conversations"), {
                    userId: user.uid,
                    title: content.substring(0, 30) + '...',
                    createdAt: new Date().toISOString(),
                });
                currentConvoId = newConvoRef.id;
                setActiveConversationId(currentConvoId);
                
                // Add new convo to local state
                const newConversation: Conversation = {
                    id: currentConvoId,
                    title: content.substring(0, 30) + '...',
                    messages: [userMessage],
                    createdAt: new Date().toISOString(),
                };
                setConversations(prev => [newConversation, ...prev]);
            }

            // Save user message to Firestore
            const { id: tempUserMsgId, ...userMessageData } = userMessage;
            await addDoc(collection(db, "conversations", currentConvoId, "messages"), userMessageData);

            let modelResponseMessage: Message;

            if (content.toLowerCase().startsWith('/imagine')) {
                 const imageUrl = await geminiService.generateImage(content.substring(8));
                 modelResponseMessage = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'model',
                    content: "",
                    image: imageUrl,
                    timestamp: new Date().toISOString(),
                };
            } else {
                const history = conversations.find(c => c.id === currentConvoId)?.messages || [];
                const stream = geminiService.generateTextStream(history, content);
                let fullText = '';
                for await (const chunk of stream) {
                    fullText += chunk;
                    // Stream to UI
                     setConversations(prev => prev.map(c => {
                        if (c.id === currentConvoId) {
                            const lastMessage = c.messages[c.messages.length - 1];
                            if (lastMessage?.role === 'model') {
                                // Update existing streaming message
                                const updatedMessages = [...c.messages.slice(0, -1), { ...lastMessage, content: fullText }];
                                return { ...c, messages: updatedMessages };
                            } else {
                                // Add new model message for streaming
                                const streamingMessage: Message = { id: `msg-streaming-${Date.now()}`, role: 'model', content: fullText, timestamp: new Date().toISOString() };
                                return { ...c, messages: [...c.messages, streamingMessage] };
                            }
                        }
                        return c;
                    }));
                }
                modelResponseMessage = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'model',
                    content: fullText,
                    timestamp: new Date().toISOString(),
                };
            }
            
            // Finalize UI update and save to DB
            const { id: tempModelMsgId, ...modelResponseMessageData } = modelResponseMessage;
            await addDoc(collection(db, "conversations", currentConvoId, "messages"), modelResponseMessageData);

            setConversations(prev => prev.map(c => {
                if (c.id === currentConvoId) {
                    // Replace streaming message with final message
                    const finalMessages = c.messages.filter(m => m.id !== `msg-streaming-${Date.now()}`); // A bit tricky to get the exact ID, better to just remove last model message if it was streaming
                    const lastMsg = finalMessages[finalMessages.length - 1];
                    if(lastMsg.role === 'model'){ // if last message was the streaming one, replace it
                        return { ...c, messages: [...finalMessages.slice(0, -1), modelResponseMessage] };
                    } // otherwise, just add it
                    return { ...c, messages: [...finalMessages, modelResponseMessage] };
                }
                return c;
            }));


        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: `msg-error-${Date.now()}`,
                role: 'model',
                content: error instanceof Error ? `Error: ${error.message}` : 'Sorry, an error occurred.',
                timestamp: new Date().toISOString(),
            };
            if(currentConvoId) {
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