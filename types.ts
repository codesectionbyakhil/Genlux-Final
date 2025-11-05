
export interface User {
  uid: string;
  name: string | null;
  email: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export interface Plan {
    name: string;
    price: string;
    priceUnit: string;
    features: string[];
    isPopular: boolean;
}