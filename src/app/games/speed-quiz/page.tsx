"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Zap, Loader2 } from "lucide-react";
import { doc, increment, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function SpeedQuizPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStarted, setGameStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const startQuiz = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await getLanguageData(profile.targetLanguage);
      const selectedWords = getRandomItems(data.words, 10);
      
      const gameItems = selectedWords.map(w => {
        const others = data.words.filter(x => x.word !== w.word);
        const distractors = getRandomItems(others, 3).map(o => o.meaning);
        return {
          word: w.word,
          meaning: w.meaning,
          correctAnswer: w.meaning,
          options: [w.meaning, ...distractors].sort(() => Math.random() - 0.5)
        };
      });

      setItems(gameItems);
      setGameStarted(true);
      setCurrentIndex(0);
      setScore(0);
      setTimeLeft(15);
      setCompleted(false);
      setSelected(null);
    } catch (err) {
      toast({ title: "Generator Offline", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && !gameStarted) {
      startQuiz();
    }
  }, [profile, gameStarted]);

  useEffect(() => {
    if (!gameStarted || completed || !!selected) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(""); // Time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, completed, selected]);

  const handleAnswer = async (option: string) => {
    if (selected) return;
    setSelected(option || "MISSED");
    const correct = option === items[currentIndex].correctAnswer;
    if (correct) {
      setScore(s => s + (timeLeft * 2));
    }

    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex(i => i + 1);
        setSelected(null);
        setTimeLeft(15);
      } else {
        finishGame(score + (correct ? timeLeft * 2 : 0));
      }
    }, 800);
  };

  const finishGame = async (finalScore: number) => {
    setCompleted(true);
    if (!profile) return;
    const xp = Math.floor(finalScore / 4);
    
    const userRef = doc(db, "users", profile.id);
    updateDocumentNonBlocking(userRef, { 
      xp: increment(xp), 
      streak: increment(1) 
    });

    addDocumentNonBlocking(collection(db, "game_scores"), {
      userId: profile.id,
      gameType: 'speed-quiz',
      score: finalScore,
      xpGained: xp,
      timestamp: serverTimestamp()
    });
  };

  if (loading && !gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Priming Bouts...</p>
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
             <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
               <Zap className="w-10 h-10 text-yellow-600 fill-yellow-600 animate-pulse" />
             </div>
             <div className="space-y-1">
               <h2 className="text-2xl font-black italic">ULTRA SPEED!</h2>
               <p className="text-lg font-bold text-muted-foreground">Final Score: {score}</p>
               <p className="text-[10px] font-black text-primary uppercase tracking-widest">+{Math.floor(score/4)} XP EARNED</p>
             </div>
             <Button onClick={startQuiz} className="lingua-button lingua-button-primary h-14 w-full">PLAY AGAIN</Button>
             <Link href="/games" className="block text-xs font-black text-muted-foreground uppercase hover:text-primary">Return to Hub</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <header className="flex justify-between items-center bg-white p-3 rounded-2xl border-b-4 border-muted shadow-sm">
               <div className="flex items-center gap-2">
                 <Timer className={cn("w-4 h-4", timeLeft < 5 ? "text-red-500 animate-pulse" : "text-primary")} />
                 <span className={cn("text-base font-black", timeLeft < 5 && "text-red-500")}>{timeLeft}s</span>
               </div>
               <div className="flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-secondary" />
                 <span className="text-base font-black">{score}</span>
               </div>
            </header>

            <div className="lingua-card bg-white p-6 text-center space-y-4 min-h-[140px] flex flex-col justify-center">
               <p className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.3em]">Match word:</p>
               <h2 className="text-3xl font-black italic text-zinc-900 leading-tight">
                 {current?.word}
               </h2>
            </div>

            <div className="grid grid-cols-1 gap-2">
               {current?.options.map((opt: string) => (
                 <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected}
                  className={cn(
                    "lingua-button h-16 text-[11px] font-black border-2 transition-all px-4",
                    selected === opt 
                      ? (opt === current.correctAnswer ? "bg-primary text-white border-primary-foreground/20" : "bg-destructive text-white border-destructive-foreground/20")
                      : (selected && opt === current.correctAnswer ? "bg-primary/20 border-primary text-primary" : "bg-white border-muted")
                  )}
                 >
                   {opt}
                 </button>
               ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}