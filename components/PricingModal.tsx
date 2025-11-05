
import React from 'react';
import { PRICING_PLANS } from '../constants';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-4xl shadow-xl p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Upgrade Your Plan</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-400 mb-8 text-center">Choose a plan that fits your needs. Note: This is a UI demonstration. Subscriptions are not functional.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan) => (
            <div key={plan.name} className={`border rounded-xl p-6 flex flex-col ${plan.isPopular ? 'border-purple-500 bg-gray-900/50' : 'border-gray-700'}`}>
              {plan.isPopular && <span className="text-xs font-bold text-purple-400 bg-purple-900/50 px-3 py-1 rounded-full self-start mb-4">POPULAR</span>}
              <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.priceUnit}</span>
              </p>
              <ul className="mt-6 space-y-3 text-gray-300 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full mt-8 py-3 font-semibold rounded-lg transition-colors ${plan.isPopular ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
