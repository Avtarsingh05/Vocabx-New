"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Repeat, Trophy, Loader2, BrainCircuit } from "lucide-react";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

interface Card {
  id: string;
  content: string;
  pairId: number;
  type: 'word' | 'meaning';
  isFlipped: boolean;
  isMatched: boolean;
}

export default function CardFlipGamePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const startNext = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await getLanguageData(profile.targetLanguage);
      const selected = getRandomItems(data.words, 6);
      
      const gameCards: Card[] = [];
      selected.forEach((w, i) => {
        gameCards.push({
          id: `w-${i}`,
          content: w.word,
          pairId: i,
          type: 'word',
          isFlipped: false,
          isMatched: false
        });
        gameCards.push({
          id: `m-${i}`,
          content: w.meaning,
          pairId: i,
          type: 'meaning',
          isFlipped: false,
          isMatched: false
        });
      });

      setCards(gameCards.sort(() => Math.random() - 0.5));
      setFlipped([]);
      setScore(0);
      setCompleted(false);
    } catch (err) {
      toast({ title: "Neural Link Offline", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) startNext();
  }, [profile]);

  const handleFlip = (index: number) => {
    if (cards[index].isMatched || cards[index].isFlipped || flipped.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (newCards[first].pairId === newCards[second].pairId) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlipped([]);
        setScore(prev => prev + 25);
        
        if (newCards.every(c => c.isMatched)) {
          setCompleted(true);
          saveScore(score + 25);
        }
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const saveScore = async (finalScore: number) => {
    if (!profile) return;
    const xp = Math.floor(finalScore / 4);
    try {
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, { xp: increment(xp), streak: increment(1) });
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Scrambling Neural Grid...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-8">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 space-y-4 pt-safe">
        {completed ? (
          <div className="text-center space-y-6 py-12 animate-in zoom-in">
             <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto shadow-xl border-b-8 border-indigo-200">
               <Repeat className="w-12 h-12 text-indigo-600 animate-bounce" />
             </div>
             <div className="space-y-1">
               <h2 className="text-3xl font-black italic uppercase">Grid Synchronized</h2>
               <p className="text-lg font-bold text-muted-foreground">Recall Points: {score}</p>
               <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">+{Math.floor(score/4)} XP Acquired</p>
             </div>
             <Button onClick={startNext} className="lingua-button lingua-button-secondary h-16 w-full text-lg">NEW SESSION</Button>
             <Link href="/games" className="block text-[10px] font-black text-muted-foreground uppercase hover:text-primary">Return to Hub</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <header className="flex justify-between items-center bg-zinc-900 text-white p-3 rounded-2xl border-b-4 border-indigo-500/20 shadow-xl">
               <div className="flex items-center gap-2">
                 <BrainCircuit className="w-4 h-4 text-indigo-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">NEURAL RECALL</span>
               </div>
               <div className="flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-yellow-400" />
                 <span className="text-base font-black">{score}</span>
               </div>
            </header>

            <div className="grid grid-cols-3 gap-2">
              {cards.map((card, i) => (
                <div
                  key={i}
                  onClick={() => handleFlip(i)}
                  className={cn(
                    "aspect-[3/4] rounded-xl border-2 transition-all duration-500 cursor-pointer flex items-center justify-center p-2 text-center text-[10px] font-black uppercase leading-tight relative preserve-3d",
                    card.isFlipped || card.isMatched ? "bg-white border-indigo-500" : "bg-indigo-600 border-indigo-700 shadow-lg rotate-y-180",
                    card.isMatched && "opacity-30 grayscale pointer-events-none"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center p-2",
                    !(card.isFlipped || card.isMatched) && "hidden"
                  )}>
                    {card.content}
                  </div>
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    (card.isFlipped || card.isMatched) && "hidden"
                  )}>
                    <Repeat className="w-6 h-6 text-white opacity-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
