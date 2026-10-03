
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Loader2, RefreshCw } from "lucide-react";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function WordMatchPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matches, setMatches] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await getLanguageData(profile?.targetLanguage);
      const randomWords = getRandomItems(data.words, 6);

      const items = randomWords.flatMap((item, i) => [
        { id: i * 2, content: item.word, type: 'word', pairId: i },
        { id: i * 2 + 1, content: item.meaning, type: 'meaning', pairId: i }
      ]);
      
      setCards(items.sort(() => Math.random() - 0.5));
      setGameStarted(true);
      setTimeLeft(60);
      setMatches([]);
      setScore(0);
      setCompleted(false);
    } catch (err) {
      toast({ title: "Logic Core Failure", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && !gameStarted) fetchContent();
  }, [profile, gameStarted]);

  useEffect(() => {
    if (!gameStarted || completed) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCompleted(true);
          saveScore(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, completed, score]);

  const handleSelect = (index: number) => {
    if (selected.length === 2 || matches.includes(index) || selected.includes(index)) return;
    
    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (cards[first].pairId === cards[second].pairId) {
        const newMatches = [...matches, first, second];
        setMatches(newMatches);
        setScore(score + 20);
        setSelected([]);
        if (newMatches.length === cards.length) {
          saveScore(score + 20);
          setCompleted(true);
        }
      } else {
        setTimeout(() => setSelected([]), 800);
      }
    }
  };

  const saveScore = async (finalScore: number) => {
    if (!profile) return;
    const xp = Math.floor(finalScore / 2);
    try {
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, { xp: increment(xp), streak: increment(1) });
    } catch (err) {}
  };

  if (loading && !gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Logic Nodes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-8">
      <Navbar />
      <main className="max-w-xl mx-auto p-4 space-y-4 pt-safe">
        <header className="flex justify-between items-center bg-zinc-900 text-white p-3 rounded-2xl border-b-4 border-primary/20 shadow-xl">
           <div className="flex items-center gap-2">
             <Timer className={cn("w-4 h-4", timeLeft < 10 ? "text-red-500 animate-pulse" : "text-primary")} />
             <span className="text-base font-black">{timeLeft}s</span>
           </div>
           <div className="flex items-center gap-2">
             <Trophy className="w-4 h-4 text-secondary" />
             <span className="text-base font-black">{score}</span>
           </div>
        </header>

        {completed ? (
          <div className="text-center space-y-6 py-12 animate-in zoom-in">
             <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-xl border-b-8 border-primary/20">
               <Trophy className="w-12 h-12 text-primary animate-bounce" />
             </div>
             <div className="space-y-1">
               <h2 className="text-3xl font-black italic uppercase">Bout Complete</h2>
               <p className="text-lg font-bold text-muted-foreground">Final Score: {score}</p>
               <p className="text-xs font-black text-primary uppercase tracking-widest">+{Math.floor(score/2)} XP Earned</p>
             </div>
             <Button onClick={fetchContent} className="lingua-button lingua-button-primary h-16 w-full text-lg">NEW MATCH</Button>
             <Link href="/games" className="block text-[10px] font-black text-muted-foreground uppercase hover:text-primary tracking-widest">Return to Arena</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((card, i) => {
              const isSelected = selected.includes(i);
              const isMatched = matches.includes(i);
              const isMismatched = selected.length === 2 && isSelected && cards[selected[0]].pairId !== cards[selected[1]].pairId;
              
              return (
                <button
                  key={card.id}
                  onClick={() => handleSelect(i)}
                  className={cn(
                    "lingua-card h-28 flex items-center justify-center text-center p-3 text-[10px] font-black uppercase tracking-tight transition-all duration-300",
                    isMatched ? "opacity-0 pointer-events-none" :
                    isSelected ? (isMismatched ? "bg-destructive text-white border-destructive scale-95" : "bg-primary text-white border-primary scale-105") : "bg-white hover:bg-zinc-50 border-muted"
                  )}
                >
                  {card.content}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
