import React from 'react';
import { Plan } from './types';

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="p-2 bg-white/10 rounded-lg mb-3">{children}</div>
);

// FIX: Refactored icon function components into constant JSX elements to resolve a TypeScript error where the 'children' prop was unexpectedly reported as missing.
const CreateImageIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></IconWrapper>;
const SummarizeTextIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></IconWrapper>;
const AnalyzeDataIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg></IconWrapper>;
const AnalyzeImagesIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></IconWrapper>;
const SurpriseMeIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></IconWrapper>;
const MakePlanIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></IconWrapper>;
const CodeIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></IconWrapper>;
const BrainstormIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></IconWrapper>;
const WriteIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></IconWrapper>;
const AdviceIcon = <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></IconWrapper>;


export const DASHBOARD_ACTIONS = [
  // FIX: Updated to reference the new icon constants directly instead of instantiating them as components.
  { title: "Create image", prompt: "/imagine a photorealistic image of a futuristic city at sunset", icon: CreateImageIcon },
  { title: "Summarize text", prompt: "Summarize the following text for me: ", icon: SummarizeTextIcon },
  { title: "Analyze data", prompt: "Analyze this data and provide key insights: ", icon: AnalyzeDataIcon },
  { title: "Analyze images", prompt: "What do you see in this image?", icon: AnalyzeImagesIcon },
  { title: "Surprise me", prompt: "Tell me a fun fact I probably don't know.", icon: SurpriseMeIcon },
  { title: "Make a plan", prompt: "Create a 7-day workout plan for a beginner.", icon: MakePlanIcon },
  { title: "Code", prompt: "Write a python function to reverse a string.", icon: CodeIcon },
  { title: "Brainstorm", prompt: "Brainstorm ideas for a new mobile app.", icon: BrainstormIcon },
  { title: "Help me write", prompt: "Help me write an email to my boss about a project delay.", icon: WriteIcon },
  { title: "Get advice", prompt: "What's the best way to ask for a raise?", icon: AdviceIcon },
];

export const PRICING_PLANS: Plan[] = [
    {
        name: 'Free',
        price: '₹0',
        priceUnit: '/month',
        features: ['50 messages per month', 'Basic AI features', 'Standard response speed'],
        isPopular: false,
    },
    {
        name: 'Individual',
        price: '₹499',
        priceUnit: '/month',
        features: ['1000 messages per month', 'Advanced AI features', 'Image generation', 'Priority access'],
        isPopular: true,
    },
    {
        name: 'Business',
        price: '₹1499',
        priceUnit: '/month',
        features: ['Unlimited messages', 'All Individual features', 'Team collaboration tools', 'Dedicated priority support'],
        isPopular: false,
    }
];