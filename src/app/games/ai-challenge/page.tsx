"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Zap, Trophy, ShieldCheck, SkipForward, Loader2 } from "lucide-react";
import { doc, increment, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function AIChallengePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const startNext = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await getLanguageData(profile.targetLanguage);
      const selectedWords = getRandomItems(data.words, 5);
      
      const gameItems = selectedWords.map(w => {
        const others = data.words.filter(x => x.word !== w.word);
        const distractors = getRandomItems(others, 3).map(o => o.word);
        return {
          question: `Decrypt: ${w.meaning}`,
          correctAnswer: w.word,
          options: [w.word, ...distractors].sort(() => Math.random() - 0.5)
        };
      });

      setItems(gameItems);
      setGameStarted(true);
      setCurrentIndex(0);
      setScore(0);
      setCompleted(false);
      setSelected(null);
    } catch (err) {
      toast({ title: "Sector Offline", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && !gameStarted) {
      startNext();
    }
  }, [profile, gameStarted]);

  const handleSkip = () => {
    if (loading || selected) return;
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
    } else {
      finishGame(score);
    }
  };

  const handleAnswer = async (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === items[currentIndex].correctAnswer;
    
    if (correct) {
      setScore(s => s + 40);
    }
    
    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex(i => i + 1);
        setSelected(null);
      } else {
        finishGame(score + (correct ? 40 : 0));
      }
    }, 1000);
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
      gameType: 'logic-challenge',
      score: finalScore,
      xpGained: xp,
      timestamp: serverTimestamp()
    });
  };

  if (loading && !gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Synchronizing Logic Chain...</p>
      </div>
    );
  }

  const current = items[currentIndex];

  return (
    <div className="min-h-screen bg-background pb-32 pt-8">
      <Navbar />
      <main className="max-w-xl mx-auto p-4 space-y-4 pt-safe">
        {completed ? (
          <div className="text-center space-y-6 py-12 animate-in zoom-in">
             <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border-b-4 border-primary/20">
               <ShieldCheck className="w-10 h-10 text-primary animate-bounce" />
             </div>
             <div className="space-y-1">
               <h2 className="text-2xl font-black italic uppercase text-zinc-900">LOGIC MASTERED</h2>
               <p className="text-lg font-bold text-muted-foreground">Mastery Score: {score}</p>
               <p className="text-[10px] font-black text-primary uppercase tracking-widest">+{Math.floor(score/2)} XP EARNED</p>
             </div>
             <Button onClick={startNext} className="lingua-button lingua-button-primary h-14 w-full">NEW CHALLENGE</Button>
             <Link href="/games" className="block text-xs font-black text-muted-foreground uppercase hover:text-primary">Return to Hub</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <header className="flex justify-between items-center bg-zinc-900 text-white p-3 rounded-2xl border-b-4 border-primary/20 shadow-xl">
               <div className="flex items-center gap-2">
                 <Zap className="w-4 h-4 text-primary fill-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest">LOGIC NODE</span>
               </div>
               <div className="flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-secondary" />
                 <span className="text-base font-black">{score}</span>
               </div>
            </header>

            <div className="lingua-card bg-white p-6 text-center space-y-4 min-h-[160px] flex flex-col justify-center border-b-8">
               <p className="text-[8px] font-black uppercase tracking-[0.5em] text-primary">Cryptic Puzzle {currentIndex + 1}</p>
               <h2 className="text-xl font-black italic text-zinc-900 leading-tight">
                 {current?.question}
               </h2>
            </div>

            <div className="grid grid-cols-1 gap-2">
               {current?.options.map((opt: string) => (
                 <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected}
                  className={cn(
                    "lingua-button h-14 text-xs font-black border-2 transition-all px-4",
                    selected === opt 
                      ? (opt === current.correctAnswer ? "bg-primary text-white border-primary-foreground/20" : "bg-destructive text-white border-destructive-foreground/20")
                      : (selected && opt === current.correctAnswer ? "bg-primary/20 border-primary text-primary" : "bg-white border-muted")
                  )}
                 >
                   {opt}
                 </button>
               ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button variant="ghost" onClick={handleSkip} disabled={!!selected || loading} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary active:scale-95 transition-all">
                <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Skip Challenge
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}