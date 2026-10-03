"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Loader2, SkipForward, BrainCircuit } from "lucide-react";
import { doc, increment, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function MemoryGamePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [phase, setPhase] = useState<'loading' | 'memorize' | 'quiz' | 'result'>('loading');
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const startNext = async () => {
    if (!profile) return;
    setLoading(true);
    setPhase('loading');
    try {
      const data = await getLanguageData(profile.targetLanguage);
      const selectedWords = getRandomItems(data.words, 5);
      
      const gameItems = selectedWords.map(w => {
        const others = data.words.filter(x => x.word !== w.word);
        const distractors = getRandomItems(others, 3).map(o => o.word);
        return {
          word: w.word,
          meaning: w.meaning,
          correctAnswer: w.word,
          options: [w.word, ...distractors].sort(() => Math.random() - 0.5)
        };
      });

      setItems(gameItems);
      setPhase('memorize');
      setTimeLeft(10);
      setScore(0);
      setCurrentIndex(0);
      setSelected(null);
      setGameStarted(true);
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

  useEffect(() => {
    if (phase !== 'memorize') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase('quiz');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === items[currentIndex].correctAnswer;
    
    if (correct) {
      setScore(s => s + 20);
    }

    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex(i => i + 1);
        setSelected(null);
      } else {
        finishGame(score + (correct ? 20 : 0));
      }
    }, 1000);
  };

  const handleSkip = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
    } else {
      finishGame(score);
    }
  };

  const finishGame = async (finalScore: number) => {
    setPhase('result');
    if (!profile) return;
    const xp = Math.floor(finalScore / 2);
    
    const userRef = doc(db, "users", profile.id);
    updateDocumentNonBlocking(userRef, { 
      xp: increment(xp), 
      streak: increment(1) 
    });

    addDocumentNonBlocking(collection(db, "game_scores"), {
      userId: profile.id,
      gameType: 'recall',
      score: finalScore,
      xpGained: xp,
      timestamp: serverTimestamp()
    });
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Synchronizing Neurons...</p>
      </div>
    );
  }

  const current = items[currentIndex];

  return (
    <div className="min-h-screen bg-background pb-32 pt-8">
      <Navbar />
      <main className="max-w-xl mx-auto p-4 space-y-4 pt-safe">
        {phase === 'memorize' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             <header className="flex justify-between items-center bg-zinc-900 text-white p-3 rounded-2xl border-b-4 border-primary/20 shadow-xl">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-xl font-black">{timeLeft}s</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-xl border border-primary/20">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">SCANNING NODE</span>
                </div>
             </header>

             <div className="grid grid-cols-1 gap-3">
                {items?.map((item, i) => (
                  <div key={i} className="lingua-card bg-white p-5 border-b-8 flex items-center gap-4 group hover:scale-[1.02] transition-transform">
                     <div className="w-8 h-8 rounded-2xl bg-zinc-900 text-primary flex items-center justify-center font-black text-xs shrink-0 shadow-lg border border-primary/20">
                       {i+1}
                     </div>
                     <div className="overflow-hidden">
                       <p className="text-xl font-black italic text-zinc-900 truncate leading-none mb-1">{item.word}</p>
                       <p className="text-[11px] font-bold text-muted-foreground truncate italic">"{item.meaning}"</p>
                     </div>
                  </div>
                ))}
             </div>
             
             <p className="text-[9px] font-black text-center text-muted-foreground uppercase tracking-[0.4em] pt-4 opacity-50">Commit words to memory immediately</p>
          </div>
        )}

        {phase === 'quiz' && current && (
          <div className="space-y-4 animate-in slide-in-from-right duration-500">
             <header className="flex justify-between items-center bg-white p-3 rounded-2xl border-b-4 border-muted shadow-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-xl">
                  <span className="text-[10px] font-black text-muted-foreground uppercase">{currentIndex + 1} / {items.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-secondary" />
                  <span className="text-lg font-black">{score}</span>
                </div>
             </header>

             <div className="lingua-card bg-zinc-900 text-white p-8 text-center space-y-3 min-h-[160px] flex flex-col justify-center border-b-[8px] border-primary/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary relative z-10">RECALL PROTOCOL</p>
                <h2 className="text-2xl font-black italic leading-tight relative z-10">
                  "{current?.meaning}"
                </h2>
             </div>

             <div className="grid grid-cols-2 gap-3">
                {(current?.options || []).map((opt: string) => (
                  <button
                   key={opt}
                   onClick={() => handleAnswer(opt)}
                   disabled={!!selected}
                   className={cn(
                     "lingua-button h-20 text-xs font-black border-2 transition-all px-2 shadow-md",
                     selected === opt 
                       ? (opt === current.correctAnswer ? "!bg-primary !text-white border-primary-foreground/20" : "!bg-destructive !text-white border-destructive-foreground/20")
                       : (selected && opt === current.correctAnswer ? "!bg-primary !text-white border-primary-foreground/20 animate-pulse" : "bg-white border-muted")
                   )}
                  >
                    {opt}
                  </button>
                ))}
             </div>

             <div className="flex justify-center pt-4">
              <Button variant="ghost" onClick={handleSkip} disabled={!!selected || loading} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary">
                <SkipForward className="w-4 h-4 mr-2" /> Skip Recall
              </Button>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center space-y-8 py-12 animate-in zoom-in duration-700">
             <div className="w-28 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto border-b-[10px] border-primary/20 shadow-2xl">
               <BrainCircuit className="w-14 h-14 text-primary animate-pulse" />
             </div>
             <div className="space-y-2">
               <h2 className="text-3xl font-black italic uppercase text-zinc-900 tracking-tighter">NEURAL SYNCED</h2>
               <p className="text-xl font-bold text-muted-foreground">Recall Accuracy: {score}%</p>
               <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mt-4">
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">+{Math.floor(score/2)} XP ACQUIRED</span>
               </div>
             </div>
             <Button onClick={startNext} className="lingua-button lingua-button-primary h-16 w-full text-lg shadow-xl">INITIATE NEW SCAN</Button>
             <Link href="/games" className="block text-[10px] font-black text-muted-foreground uppercase hover:text-primary tracking-[0.3em]">Exit Neural Node</Link>
          </div>
        )}
      </main>
    </div>
  );
}