"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2 } from "lucide-react";
import { doc, increment, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function DragDropPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<number | null>(null);
  const [matches, setMatches] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [shuffledDefs, setShuffledDefs] = useState<any[]>([]);

  const startNext = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await getLanguageData(profile.targetLanguage);
      const selectedWords = getRandomItems(data.words, 5);
      
      const gameItems = selectedWords.map((w, i) => ({
        word: w.word,
        meaning: w.meaning,
        originalIdx: i
      }));

      setItems(gameItems);
      setShuffledDefs([...gameItems].sort(() => Math.random() - 0.5));
      setGameStarted(true);
      setScore(0);
      setMatches([]);
      setCompleted(false);
    } catch (err) {
      toast({ title: "Vault Offline", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && !gameStarted) {
      startNext();
    }
  }, [profile, gameStarted]);

  const handleMatch = (wordIdx: number, defIdx: number) => {
    if (wordIdx === defIdx) {
      setMatches([...matches, wordIdx]);
      setScore(s => s + 20);
      if (matches.length + 1 === items.length) {
        finishGame(score + 20);
      }
    }
    setSelectedWord(null);
    setSelectedDefinition(null);
  };

  const finishGame = async (finalScore: number) => {
    setCompleted(true);
    if (!profile) return;
    const xp = Math.floor(finalScore / 2);
    
    const userRef = doc(db, "users", profile.id);
    updateDocumentNonBlocking(userRef, { 
      xp: increment(xp), 
      streak: increment(1) 
    });

    addDocumentNonBlocking(collection(db, "game_scores"), {
      userId: profile.id,
      gameType: 'drag-drop',
      score: finalScore,
      xpGained: xp,
      timestamp: serverTimestamp()
    });
  };

  if (loading && !gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Generating Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-8">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 space-y-4 pt-safe">
        {completed ? (
          <div className="text-center space-y-6 py-12 animate-in zoom-in">
             <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
               <Trophy className="w-10 h-10 text-orange-600 animate-bounce" />
             </div>
             <div className="space-y-1">
               <h2 className="text-2xl font-black italic uppercase">MATCH MASTER!</h2>
               <p className="text-lg font-bold text-muted-foreground">Score: {score}</p>
               <p className="text-[10px] font-black text-primary uppercase tracking-widest">+{Math.floor(score/2)} XP EARNED</p>
             </div>
             <Button onClick={startNext} className="lingua-button lingua-button-primary h-14 w-full">PLAY AGAIN</Button>
             <Link href="/games" className="block text-xs font-black text-muted-foreground uppercase hover:text-primary">Return to Hub</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <header className="flex justify-between items-center bg-white p-3 rounded-2xl border-b-4 border-muted shadow-sm">
               <div className="flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-orange-500" />
                 <span className="text-base font-black">{score}</span>
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{matches.length} / {items.length} Matches</span>
            </header>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground text-center">Words</p>
                 {items.map((item, i) => (
                   <button
                    key={i}
                    onClick={() => {
                      if (matches.includes(i)) return;
                      setSelectedWord(i);
                      if (selectedDefinition !== null) handleMatch(i, selectedDefinition);
                    }}
                    className={cn(
                      "w-full h-16 lingua-card text-[10px] font-black italic transition-all p-2",
                      matches.includes(i) ? "opacity-0 pointer-events-none" :
                      selectedWord === i ? "bg-primary text-white border-primary-foreground/20" : "bg-white"
                    )}
                   >
                     {item.word}
                   </button>
                 ))}
               </div>

               <div className="space-y-2">
                 <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground text-center">Definitions</p>
                 {shuffledDefs.map((item, i) => (
                   <button
                    key={i}
                    onClick={() => {
                      if (matches.includes(item.originalIdx)) return;
                      setSelectedDefinition(item.originalIdx);
                      if (selectedWord !== null) handleMatch(selectedWord, item.originalIdx);
                    }}
                    className={cn(
                      "w-full h-16 lingua-card text-[8px] font-bold leading-tight transition-all p-2",
                      matches.includes(item.originalIdx) ? "opacity-0 pointer-events-none" :
                      selectedDefinition === item.originalIdx ? "bg-primary text-white border-primary-foreground/20" : "bg-white"
                    )}
                   >
                     {item.meaning}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}