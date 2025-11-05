
import React, { useState } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatView from './components/ChatView';
import PricingModal from './components/PricingModal';
import ApiKeyErrorModal from './components/ApiKeyErrorModal';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';

export default function App(): React.JSX.Element {
  const { user, login, signup, logout, resetPassword } = useAuth();
  const {
    conversations,
    activeConversation,
    sendMessage,
    startNewChat,
    setActiveConversationId,
    isLoading,
    isApiKeyMissing,
    clearApiKeyMissingError,
  } = useChat(user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  
  if (user === undefined) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900">
            <h1 className="text-3xl font-bold text-purple-400">Genlux AI</h1>
        </div>
    );
  }

  if (!user) {
    return <Auth onLogin={login} onSignup={signup} onResetPassword={resetPassword} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      <ApiKeyErrorModal isOpen={isApiKeyMissing} onClose={clearApiKeyMissingError} />
      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
      <Sidebar
        user={user}
        onLogout={logout}
        conversations={conversations}
        onNewChat={startNewChat}
        onSelectConversation={setActiveConversationId}
        activeConversationId={activeConversation?.id ?? null}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onUpgrade={() => setIsPricingModalOpen(true)}
      />
      <main className="flex-1 flex flex-col transition-all duration-300">
        <div className="flex-shrink-0 lg:hidden p-2 bg-gray-800 border-b border-gray-700">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {activeConversation && activeConversation.messages.length > 0 ? (
            <ChatView
              conversation={activeConversation}
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          ) : (
            <Dashboard onActionSelect={sendMessage} />
          )}
        </div>
      </main>
    </div>
  );
}