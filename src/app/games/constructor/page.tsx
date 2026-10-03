"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Boxes, Trophy, RotateCcw, Loader2, SkipForward } from "lucide-react";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function ConstructorGamePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rounds, setRounds] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [assembled, setAssembled] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const startNext = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await getLanguageData(profile.targetLanguage);
      const selected = getRandomItems(data.words, 5);
      
      const gameRounds = selected.map(w => {
        const words = w.example.split(" ").filter(t => t.length > 0);
        return {
          original: w.example,
          fragments: [...words].sort(() => Math.random() - 0.5),
          meaning: w.meaning
        };
      });

      setRounds(gameRounds);
      initRound(gameRounds[0]);
      setScore(0);
      setCurrentRound(0);
      setCompleted(false);
    } catch (err) {
      toast({ title: "Construction Node Offline", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const initRound = (round: any) => {
    setAssembled([]);
    setShuffled(round.fragments);
  };

  useEffect(() => {
    if (profile) startNext();
  }, [profile]);

  const handleSelect = (word: string, index: number) => {
    setAssembled([...assembled, word]);
    setShuffled(shuffled.filter((_, i) => i !== index));
  };

  const resetRound = () => {
    initRound(rounds[currentRound]);
  };

  const checkSentence = async () => {
    const round = rounds[currentRound];
    const userSentence = assembled.join(" ").trim();
    const target = round.original.trim();

    if (userSentence === target) {
      const newScore = score + 20;
      setScore(newScore);
      toast({ title: "Structure Optimized!" });
      
      if (currentRound + 1 < rounds.length) {
        setCurrentRound(prev => prev + 1);
        initRound(rounds[currentRound + 1]);
      } else {
        setCompleted(true);
        saveProgress(newScore);
      }
    } else {
      toast({ title: "Syntax Error", description: "Try again!", variant: "destructive" });
      resetRound();
    }
  };

  const saveProgress = async (finalScore: number) => {
    if (!profile) return;
    const xp = Math.floor(finalScore / 2);
    try {
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, { xp: increment(xp), streak: increment(1) });
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Architecting Grammars...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-8">
      <Navbar />
      <main className="max-w-xl mx-auto p-4 space-y-4 pt-safe">
        {completed ? (
          <div className="text-center space-y-6 py-12 animate-in zoom-in">
             <div className="w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center mx-auto shadow-xl border-b-8 border-cyan-200">
               <Boxes className="w-12 h-12 text-cyan-600 animate-bounce" />
             </div>
             <div className="space-y-1">
               <h2 className="text-3xl font-black italic uppercase">Architecture Solid</h2>
               <p className="text-lg font-bold text-muted-foreground">Mastery Score: {score}</p>
               <p className="text-xs font-black text-[#22c55e] uppercase tracking-widest">+{Math.floor(score/2)} XP Earned</p>
             </div>
             <Button onClick={startNext} className="lingua-button lingua-button-primary h-16 w-full text-lg">NEW PROJECT</Button>
             <Link href="/games" className="block text-[10px] font-black text-muted-foreground uppercase hover:text-primary">Return to Hub</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <header className="flex justify-between items-center bg-zinc-900 text-white p-3 rounded-2xl border-b-4 border-cyan-500/20 shadow-xl">
               <div className="flex items-center gap-2">
                 <Boxes className="w-4 h-4 text-cyan-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest">PHASE {currentRound + 1}/5</span>
               </div>
               <div className="flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-yellow-400" />
                 <span className="text-base font-black">{score}</span>
               </div>
            </header>

            <div className="lingua-card bg-white p-6 border-b-8 space-y-4">
              <p className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.4em] text-center">Construct meaning:</p>
              <h2 className="text-xl font-bold text-center italic text-cyan-600">"{rounds[currentRound].meaning}"</h2>
              
              <div className="min-h-[100px] bg-zinc-50 rounded-2xl border-2 border-dashed border-muted flex flex-wrap gap-2 p-4 content-start">
                {assembled.map((word, i) => (
                  <span key={i} className="bg-cyan-500 text-white px-3 py-1.5 rounded-xl font-black text-sm shadow-sm animate-in zoom-in">
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 py-4">
              {shuffled.map((word, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(word, i)}
                  className="bg-white border-2 border-muted hover:border-cyan-500 px-4 py-2 rounded-xl font-black text-sm transition-all active:scale-95 shadow-sm"
                >
                  {word}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button variant="ghost" onClick={resetRound} className="h-14 rounded-2xl border-2 border-muted font-black text-xs uppercase tracking-widest">
                <RotateCcw className="w-4 h-4 mr-2" /> CLEAR
              </Button>
              <Button onClick={checkSentence} disabled={shuffled.length > 0} className="lingua-button lingua-button-primary h-14 text-sm">
                VALIDATE
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
