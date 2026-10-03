
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface LearnedWord {
  word: string;
  meaning: string;
  example: string;
  date: string;
  subject?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  targetLanguage: string;
  grade?: number; // 1 to 12
  lastActiveDate?: string;
  dailyGoal: number;
  isAdmin?: boolean;
  learnedWords?: LearnedWord[];
  weakWords?: string[];
  masteryCertified?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);

      if (authUser) {
        const profileRef = doc(db, "users", authUser.uid);
        const unsubProfile = onSnapshot(profileRef, async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            
            // AUTOMATIC LEVEL EVOLUTION LOGIC
            let newLevel = data.level;
            if (data.xp >= 3000) newLevel = "Advanced";
            else if (data.xp >= 1000) newLevel = "Intermediate";
            else newLevel = "Beginner";

            if (newLevel !== data.level) {
              await updateDoc(profileRef, { level: newLevel });
            }

            setProfile({ ...data, level: newLevel as any });
          } else {
            const newProfile: UserProfile = {
              id: authUser.uid,
              name: authUser.displayName || authUser.email?.split("@")[0] || "Scholar",
              email: authUser.email || "",
              xp: 0,
              streak: 0,
              level: "Beginner",
              targetLanguage: "English",
              grade: 1, // Default to Grade 1
              dailyGoal: 50,
              lastActiveDate: new Date().toISOString(),
              learnedWords: [],
              weakWords: [],
              isAdmin: false
            };
            await setDoc(profileRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
