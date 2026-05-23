'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db, ref, onValue, set } from '@/lib/firebase';
import { get, child } from 'firebase/database';

interface AuthContextType {
  user: User | null;
  username: string;
  userScore: number;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: '',
  userScore: 0,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

// Extract username from email: dipanjanmaity890@gmail.com -> dipanjanmaity890
function extractUsername(email: string | null): string {
  if (!email) return 'Fan';
  return email.split('@')[0];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDB: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const username = extractUsername(firebaseUser.email);
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        
        // Check if user exists, if not initialize them
        const snapshot = await get(child(ref(db), `users/${firebaseUser.uid}`));
        if (!snapshot.exists()) {
          await set(userRef, {
            username,
            points: 1000,
            email: firebaseUser.email,
          });
          setUserScore(1000);
        } else {
          setUserScore(snapshot.val().points || 0);
        }

        // Subscribe to real-time score updates
        unsubDB = onValue(userRef, (snap) => {
          if (snap.exists()) {
            setUserScore(snap.val().points || 0);
          }
        });
        setLoading(false);
      } else {
        if (unsubDB) unsubDB();
        setUserScore(0);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubDB) unsubDB();
    };
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user,
      username: extractUsername(user?.email ?? null),
      userScore,
      loading,
      signInWithGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
