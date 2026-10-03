
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Trophy, SkipForward, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { doc, increment, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function ImageVocabPage() {
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
          word: w.word,
          correctAnswer: w.word,
          imagePrompt: `Identify the visual representation of this ${profile.targetLanguage} lexeme.`,
          imageHint: `${w.word} ${profile.targetLanguage}`,
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

  const handleSkip = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
    } else {
      finishGame(score);
    }
  };

  const handleAnswer = async (option: string) => {
    if (selected) return;
    const currentItem = items[currentIndex];
    setSelected(option);
    const correct = option === currentItem?.correctAnswer;
    
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
      gameType: 'image-link',
      score: finalScore,
      xpGained: xp,
      timestamp: serverTimestamp()
    });
  };

  if (loading && !gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Synchronizing Visual Nodes...</p>
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
             <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-b-8 border-primary/20">
               <Trophy className="w-12 h-12 text-primary animate-bounce" />
             </div>
             <div className="space-y-1">
               <h2 className="text-3xl font-black italic uppercase text-zinc-900">VISUAL SYNCED</h2>
               <p className="text-xl font-bold text-muted-foreground">Mastery Score: {score}</p>
               <p className="text-xs font-black text-primary uppercase tracking-widest mt-2">+{Math.floor(score/2)} XP EARNED</p>
             </div>
             <Button onClick={startNext} className="lingua-button lingua-button-primary h-16 w-full text-lg">NEW BOUT</Button>
             <Link href="/games" className="block text-[10px] font-black text-muted-foreground uppercase hover:text-primary tracking-widest">Return to Hub</Link>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right duration-500">
            <header className="flex justify-between items-center bg-zinc-900 text-white p-3 rounded-2xl border-b-4 border-primary/20 shadow-xl">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-primary fill-primary animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest">BOUT {currentIndex + 1}/5</span>
               </div>
               <div className="flex items-center gap-2">
                 <Trophy className="w-4 h-4 text-secondary" />
                 <span className="text-base font-black">{score}</span>
               </div>
            </header>

            <div className="lingua-card bg-white p-1.5 border-b-8 overflow-hidden relative">
               <div className="relative aspect-video rounded-[1.5rem] overflow-hidden shadow-inner bg-muted">
                 {current?.word && (
                   <Image 
                    src={`https://picsum.photos/seed/${current.word}/600/400`}
                    alt="Neural Visual"
                    fill
                    className="object-cover"
                    data-ai-hint={current?.imageHint || "object"}
                   />
                 )}
               </div>
               <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border-2 border-primary/20 shadow-lg flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary leading-none">OFFLINE CORE</span>
                  </div>
               </div>
            </div>

            <div className="bg-zinc-900 text-white rounded-[2rem] p-6 border-b-[8px] border-primary/20 flex flex-col items-center gap-3 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-16 -mt-16" />
               <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 relative z-10">
                 <AlertCircle className="w-6 h-6 text-primary" />
               </div>
               <div className="text-center space-y-1 relative z-10">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Neural Clue</p>
                 <h2 className="text-xl font-black italic leading-tight text-white px-2">
                   "{current?.imagePrompt}"
                 </h2>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               {(current?.options || ["...", "...", "...", "..."]).map((opt: string) => (
                 <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected || opt === "..."}
                  className={cn(
                    "lingua-button h-16 text-xs font-black border-2 transition-all px-2 shadow-md",
                    selected === opt 
                      ? (opt === current?.correctAnswer ? "!bg-primary !text-white border-primary-foreground/20" : "!bg-destructive !text-white border-destructive-foreground/20")
                      : (selected && opt === current?.correctAnswer ? "!bg-primary !text-white border-primary-foreground/20 animate-pulse" : "bg-white border-muted")
                  )}
                 >
                   {opt}
                 </button>
               ))}
            </div>

            <div className="flex justify-center pt-2">
              <Button variant="ghost" onClick={handleSkip} disabled={!!selected || loading} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                <SkipForward className="w-3.5 h-3.5 mr-2" /> Skip Challenge
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
