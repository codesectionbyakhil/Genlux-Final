
import React from 'react';
import { Conversation, User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  conversations: Conversation[];
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  activeConversationId: string | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onUpgrade: () => void;
}

export default function Sidebar({
  user,
  onLogout,
  conversations,
  onNewChat,
  onSelectConversation,
  activeConversationId,
  isOpen,
  setIsOpen,
  onUpgrade,
}: SidebarProps): React.JSX.Element {

  const sortedConversations = [...conversations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const content = (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white">Genlux AI</h1>
        <button
          onClick={onNewChat}
          className="w-full mt-4 flex items-center justify-center p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        <nav className="space-y-1">
          {sortedConversations.map((convo) => (
            <a
              key={convo.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectConversation(convo.id);
                setIsOpen(false);
              }}
              className={`block p-3 rounded-lg truncate text-sm transition-colors ${
                activeConversationId === convo.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {convo.title}
            </a>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700 space-y-3">
        <button 
          onClick={onUpgrade} 
          className="w-full flex items-center p-3 text-sm text-yellow-300 bg-yellow-900/50 rounded-lg hover:bg-yellow-800/50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Upgrade Plan
        </button>
        <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white mr-3">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button onClick={onLogout} title="Logout" className="ml-2 p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-gray-900/80 z-40 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white flex flex-col z-50 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:w-72 flex-shrink-0`}>
        {content}
      </aside>
    </>
  );
}
