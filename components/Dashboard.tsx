
import React from 'react';
import { DASHBOARD_ACTIONS } from '../constants';

interface DashboardProps {
  onActionSelect: (prompt: string) => void;
}

export default function Dashboard({ onActionSelect }: DashboardProps): React.JSX.Element {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 p-4 sm:p-6 overflow-y-auto">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Genlux AI
        </h1>
        <p className="mt-2 text-lg text-gray-400">How can I help you today?</p>
      </div>
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {DASHBOARD_ACTIONS.map((action) => (
            <button
              key={action.title}
              onClick={() => onActionSelect(action.prompt)}
              className="group flex flex-col items-start p-4 bg-gray-900/50 hover:bg-gray-700 rounded-xl transition-all duration-300 text-left"
            >
              {action.icon}
              <h3 className="font-semibold text-sm text-gray-200">{action.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
