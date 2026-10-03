
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, Trophy, SkipForward, Loader2 } from "lucide-react";
import { doc, increment, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function SpellingPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const startNext = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await getLanguageData(profile.targetLanguage);
      const selectedWords = getRandomItems(data.words, 5);
      
      setItems(selectedWords);
      setGameStarted(true);
      setCurrentIndex(0);
      setScore(0);
      setCompleted(false);
      setInput("");
      setFeedback(null);
    } catch (err) {
      toast({ title: "Generator Offline", variant: "destructive" });
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
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(i => i + 1);
      setInput("");
      setFeedback(null);
    } else {
      finishGame(score);
    }
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      'English': 'en-US', 'Hindi': 'hi-IN', 'Punjabi': 'pa-IN',
      'Spanish': 'es-ES', 'French': 'fr-FR', 'German': 'de-DE',
      'Italian': 'it-IT', 'Japanese': 'ja-JP', 'Mandarin': 'zh-CN',
      'Sanskrit': 'hi-IN', 'Bhojpuri': 'hi-IN', 'Haryanvi': 'hi-IN'
    };
    utterance.lang = langMap[profile?.targetLanguage || 'English'] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (feedback || !input.trim()) return;

    const current = items[currentIndex];
    const isCorrect = input.trim().toLowerCase() === current.word.toLowerCase();
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 20);
      setTimeout(() => {
        if (currentIndex + 1 < items.length) {
          setCurrentIndex(i => i + 1);
          setInput("");
          setFeedback(null);
        } else {
          finishGame(score + 20);
        }
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setInput("");
      }, 1200);
    }
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
      gameType: 'spelling',
      score: finalScore,
      xpGained: xp,
      timestamp: serverTimestamp()
    });
  };

  if (loading && !gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Tuning Vocals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-14">
      <Navbar />
      <main className="max-w-xl mx-auto p-4 space-y-4">
        {completed ? (
          <div className="text-center space-y-6 py-12 animate-in zoom-in">
             <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
               <Trophy className="w-10 h-10 text-purple-600 animate-bounce" />
             </div>
             <div className="space-y-1">
               <h2 className="text-2xl font-black italic uppercase text-zinc-900">SPELLER ELITE</h2>
               <p className="text-lg font-bold text-muted-foreground">Score: {score}</p>
               <p className="text-[10px] font-black text-primary uppercase tracking-widest">+{Math.floor(score/2)} XP EARNED</p>
             </div>
             <Button onClick={startNext} className="lingua-button lingua-button-primary h-14 w-full">PLAY AGAIN</Button>
             <Link href="/games" className="block text-xs font-black text-muted-foreground uppercase hover:text-primary">Return to Hub</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <header className="flex justify-between items-center bg-white p-3 rounded-2xl border-b-4 border-muted shadow-sm">
               <span className="text-[10px] font-black text-muted-foreground uppercase">{currentIndex + 1} / {items.length}</span>
               <div className="flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-secondary" />
                 <span className="text-base font-black">{score}</span>
               </div>
            </header>

            <div className="lingua-card bg-white p-8 flex flex-col items-center justify-center space-y-4 border-b-8">
               <button 
                onClick={() => speak(items[currentIndex].word)}
                className="w-24 h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/20 active:scale-90 transition-all hover:bg-primary/95"
               >
                 <Volume2 className="w-10 h-10" />
               </button>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Listen Closely</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               <Input 
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type word..."
                className={cn(
                  "h-16 rounded-2xl border-[4px] text-center text-xl font-black uppercase tracking-widest transition-all",
                  feedback === 'correct' ? "border-primary bg-primary text-white" : 
                  feedback === 'wrong' ? "border-destructive bg-destructive text-white" :
                  "border-muted focus:border-primary shadow-inner bg-muted/10"
                )}
               />
               <div className="flex gap-2">
                 <Button type="submit" disabled={!!feedback || !input.trim()} className="flex-1 h-16 rounded-2xl lingua-button lingua-button-primary text-lg shadow-lg">
                   {feedback === 'correct' ? "EXCELLENT!" : feedback === 'wrong' ? "TYPO!" : "SUBMIT"}
                 </Button>
                 <button type="button" onClick={handleSkip} disabled={!!feedback} className="w-16 h-16 rounded-2xl bg-white border-muted border-[4px] flex items-center justify-center hover:text-primary transition-colors active:scale-95 shadow-sm">
                   <SkipForward className="w-6 h-6" />
                 </button>
               </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
