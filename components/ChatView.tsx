
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Conversation, Message } from '../types';

interface ChatViewProps {
  conversation: Conversation;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

// Define component outside to avoid re-creation on re-renders
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xl px-4 py-3 rounded-2xl ${isUser ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
        {message.image ? (
            <img src={message.image} alt="Generated content" className="rounded-lg max-w-xs" />
        ) : (
            <p className="text-base whitespace-pre-wrap">{message.content}</p>
        )}
        <p className="text-xs mt-2 opacity-50 text-right">{new Date(message.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  );
};


export default function ChatView({ conversation, onSendMessage, isLoading }: ChatViewProps): React.JSX.Element {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isLoading]);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-800 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-xl px-4 py-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none flex items-center space-x-2">
              <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-end bg-gray-700 rounded-xl p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    handleSubmit(e);
                }
            }}
            placeholder="Ask Genlux AI..."
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-400 resize-none focus:outline-none p-2 max-h-48"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="ml-2 p-2 rounded-lg bg-purple-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
