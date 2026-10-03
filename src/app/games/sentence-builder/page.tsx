"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Loader2, SkipForward } from "lucide-react";
import { doc, increment, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function SentenceBuilderPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
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
      
      const gameItems = selectedWords.map(w => ({
        sentence: w.example,
        jumbledWords: w.example.split(" ").sort(() => Math.random() - 0.5)
      }));

      setItems(gameItems);
      setGameStarted(true);
      setCurrentIndex(0);
      setScore(0);
      setCompleted(false);
      initRound(gameItems[0]);
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

  const initRound = (item: any) => {
    if (!item) return;
    setBuiltWords([]);
    setAvailableWords([...item.jumbledWords]);
    setFeedback(null);
  };

  const handleWordClick = (word: string, index: number) => {
    if (feedback) return;
    setBuiltWords([...builtWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  const resetRound = () => {
    if (items[currentIndex]) initRound(items[currentIndex]);
  };

  const handleSkip = () => {
    if (currentIndex + 1 < items.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      initRound(items[nextIdx]);
    } else {
      finishGame(score);
    }
  };

  const checkSentence = () => {
    const current = items[currentIndex];
    const normalize = (s: string) => s.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ").trim().toLowerCase();
    
    const userBuilt = normalize(builtWords.join(" "));
    const target = normalize(current.sentence);
    
    const isCorrect = userBuilt === target;
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 20);
      setTimeout(() => {
        if (currentIndex + 1 < items.length) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          initRound(items[nextIdx]);
        } else {
          finishGame(score + 20);
        }
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        resetRound();
      }, 1000);
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
      gameType: 'sentence-builder',
      score: finalScore,
      xpGained: xp,
      timestamp: serverTimestamp()
    });
  };

  if (loading && !gameStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
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
             <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
               <Trophy className="w-10 h-10 text-cyan-600 animate-bounce" />
             </div>
             <div className="space-y-1">
               <h2 className="text-2xl font-black italic uppercase">CONSTRUCTOR MASTER</h2>
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

            <div className={cn(
              "lingua-card min-h-[140px] p-6 border-b-[8px] flex flex-wrap gap-2 content-start transition-all duration-300",
              feedback === 'correct' ? "bg-primary border-primary-foreground/20 text-white" : 
              feedback === 'wrong' ? "bg-destructive border-destructive-foreground/20 text-white" : "bg-white"
            )}>
               {builtWords.map((word, i) => (
                 <span key={i} className={cn("px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm", feedback ? "bg-white/20" : "bg-muted")}>{word}</span>
               ))}
               {builtWords.length === 0 && <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-30 italic">Tap words below...</p>}
            </div>

            <div className="flex justify-between items-center px-1">
              <Button variant="ghost" size="sm" onClick={resetRound} disabled={!!feedback || builtWords.length === 0} className="h-10 text-[9px] font-black uppercase tracking-widest bg-white border-2 border-muted rounded-xl">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> CLEAR
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSkip} disabled={!!feedback} className="h-10 text-[9px] font-black uppercase tracking-widest hover:text-primary bg-white border-2 border-muted rounded-xl">
                <SkipForward className="w-3.5 h-3.5 mr-1.5" /> SKIP
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-3 py-4">
               {availableWords.map((word, i) => (
                 <button
                  key={i}
                  onClick={() => handleWordClick(word, i)}
                  disabled={!!feedback}
                  className="lingua-button bg-white border-muted h-14 px-5 text-sm font-black active:scale-95 shadow-sm"
                 >
                   {word}
                 </button>
               ))}
            </div>

            {availableWords.length === 0 && !feedback && (
              <Button onClick={checkSentence} className="w-full h-16 lingua-button lingua-button-primary text-lg animate-in slide-in-from-bottom-2 shadow-xl shadow-primary/20">
                CHECK SENTENCE
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}