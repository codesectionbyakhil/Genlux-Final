import { useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../backend/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: firebase.User | null) => {
      if (firebaseUser) {
        setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    await auth.signInWithEmailAndPassword(email, pass);
  };

  const signup = async (name: string, email: string, pass: string): Promise<void> => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
    if (userCredential.user) {
        await userCredential.user.updateProfile({ displayName: name });
        // Manually set user state after profile update to reflect name immediately
        setUser({
            uid: userCredential.user.uid,
            name: name,
            email: userCredential.user.email,
        });
    }
  };

  const logout = async (): Promise<void> => {
    await auth.signOut();
  };

  const resetPassword = async (email: string): Promise<void> => {
    await auth.sendPasswordResetEmail(email);
  }

  return { user, login, signup, logout, resetPassword };
};