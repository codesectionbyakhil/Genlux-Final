
import { useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../backend/firebase';
// FIX: Import firebase compat for types, and remove modular imports from 'firebase/auth' to resolve export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    // FIX: Switched to the v8 compat `auth.onAuthStateChanged` method.
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
    // FIX: Switched to the v8 compat `auth.signInWithEmailAndPassword` method.
    await auth.signInWithEmailAndPassword(email, pass);
  };

  const signup = async (name: string, email: string, pass: string): Promise<void> => {
    // FIX: Switched to the v8 compat `auth.createUserWithEmailAndPassword` method.
    const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
    // FIX: Switched to the v8 compat `user.updateProfile` method and added a null check for safety.
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
    // FIX: Switched to the v8 compat `auth.signOut` method.
    await auth.signOut();
  };

  const resetPassword = async (email: string): Promise<void> => {
    // FIX: Switched to the v8 compat `auth.sendPasswordResetEmail` method.
    await auth.sendPasswordResetEmail(email);
  }

  return { user, login, signup, logout, resetPassword };
};
