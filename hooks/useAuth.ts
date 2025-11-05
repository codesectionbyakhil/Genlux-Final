
import { useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../backend/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
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
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (name: string, email: string, pass: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    // Manually set user state after profile update to reflect name immediately
    setUser({
        uid: userCredential.user.uid,
        name: name,
        email: userCredential.user.email,
    });
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  }

  return { user, login, signup, logout, resetPassword };
};