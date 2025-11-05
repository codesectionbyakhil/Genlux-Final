
import React from 'react';

interface ApiKeyErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyErrorModal({ isOpen, onClose }: ApiKeyErrorModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-md shadow-xl p-8 border border-red-500/50" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mr-4 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Configuration Required</h2>
        </div>
        <div className="text-gray-300 space-y-4 text-sm">
          <p>The application is not configured correctly. The <code className="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded">API_KEY</code> for the Gemini API is missing on the server.</p>
          <p>This is not an error in the app's code, but a necessary security step. The API key must be set as an <strong className="text-white">environment variable</strong> in your deployment settings to keep it safe.</p>
          <p>Please consult the documentation for your hosting provider (e.g., Cloudflare Pages, Vercel, Netlify) on how to add an environment variable named <code className="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded">API_KEY</code>.</p>
        </div>
        <div className="mt-8 text-right">
          <button onClick={onClose} className="py-2 px-5 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition duration-300">
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
