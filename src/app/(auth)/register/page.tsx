"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const LANGUAGES = [
  "English", "Hindi", "Sanskrit", "Punjabi", "Bhojpuri", "Haryanvi", 
  "Spanish", "French", "German", "Italian", "Japanese", "Mandarin"
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const profileData = {
        id: user.uid,
        name,
        email,
        xp: 0,
        streak: 0,
        level: "Beginner",
        targetLanguage,
        dailyGoal: 50,
        lastActiveDate: new Date().toISOString(),
        isAdmin: false,
        learnedWords: [],
        dailyWordCompleted: false,
        currentBatch: [],
        currentBatchLanguage: targetLanguage
      };

      const profileRef = doc(db, "users", user.uid);
      setDoc(profileRef, profileData)
        .then(() => router.push("/dashboard"))
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: profileRef.path,
            operation: 'create',
            requestResourceData: profileData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="h-svh bg-background flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      <div className="mb-6 flex flex-col items-center gap-1 animate-in slide-in-from-top-4">
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#22c55e] tracking-tighter italic leading-none">Vocab<span className="text-zinc-950">X</span></h1>
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-900/40 mt-2">Master Your Mind</p>
        </div>
      </div>

      <div className="w-full max-w-[340px] bg-white rounded-[2rem] border-b-8 border-muted shadow-2xl p-6 md:p-8 space-y-3 animate-in fade-in zoom-in-95">
        <h2 className="text-lg font-black tracking-tight text-center mb-1">Create Profile</h2>

        <form onSubmit={handleRegister} className="grid grid-cols-1 gap-2">
          <div className="space-y-1">
            <Label className="font-black text-[7px] uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
            <Input 
              className="h-10 rounded-xl border text-[11px] font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1">
            <Label className="font-black text-[7px] uppercase tracking-widest text-muted-foreground ml-1">Language</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="h-10 rounded-xl border text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-primary" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang} className="font-bold py-2 text-[11px] uppercase tracking-widest">{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="font-black text-[7px] uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
            <Input 
              type="email" 
              className="h-10 rounded-xl border text-[11px] font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="font-black text-[7px] uppercase tracking-widest text-muted-foreground ml-1">Passcode</Label>
            <Input 
              type="password" 
              className="h-10 rounded-xl border border-muted text-[11px] font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full lingua-button lingua-button-primary h-12 text-[10px] mt-2 rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "START JOURNEY"}
          </Button>
        </form>

        <div className="pt-3 border-t border-muted text-center">
          <p className="text-muted-foreground font-bold text-[8px]">
            Already a Scholar? <Link href="/" className="text-primary hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
