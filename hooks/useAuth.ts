
import { useState, useEffect } from 'react';
import { User } from '../types';

const USERS_KEY = 'genlux_ai_users';
const CURRENT_USER_KEY = 'genlux_ai_current_user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for a logged-in user on initial load
    const storedUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUserEmail) {
      const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const loggedInUser = users.find(u => u.email === storedUserEmail);
      if (loggedInUser) {
        setUser(loggedInUser);
      }
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // NOTE: This is a mock authentication system. Passwords are not hashed.
    // In a real application, never store plain text passwords.
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // Mock password check. In a real app, this would be a hash comparison.
    // For this demo, we'll just find the user by email. We assume passwords are correct if user exists.
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(CURRENT_USER_KEY, foundUser.email);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, pass: string): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.some(u => u.email === email)) {
      return false; // User already exists
    }
    const newUser: User = { name, email };
    const newUsers = [...users, newUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, newUser.email);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return { user, login, signup, logout };
};
