"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Compass, Trophy, Loader2, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getLanguageData, getRandomItems } from "@/lib/data-loader";

export default function RiddleMazePage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [riddles, setRiddles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);

  const startMaze = async () => {
    if (!profile) return;
    setLoading(true);
    setFailed(false);
    setCompleted(false);
    setCurrentIndex(0);
    setSelected(null);
    
    try {
      const data = await getLanguageData(profile.targetLanguage);
      const selectedWords = getRandomItems(data.words, 5);
      
      const mazeRiddles = selectedWords.map(w => {
        const others = data.words.filter(x => x.word !== w.word);
        return {
          riddle: w.meaning,
          correct: w.word,
          options: [w.word, ...getRandomItems(others, 3).map(o => o.word)].sort(() => Math.random() - 0.5)
        };
      });

      setRiddles(mazeRiddles);
    } catch (err) {
      toast({ title: "Sector Failure", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) startMaze();
  }, [profile]);

  const handleChoice = async (option: string) => {
    if (selected) return;
    setSelected(option);

    const isCorrect = option === riddles[currentIndex].correct;

    if (isCorrect) {
      setTimeout(() => {
        if (currentIndex + 1 < riddles.length) {
          setCurrentIndex(prev => prev + 1);
          setSelected(null);
        } else {
          setCompleted(true);
          saveScore();
        }
      }, 800);
    } else {
      setTimeout(() => setFailed(true), 800);
    }
  };

  const saveScore = async () => {
    if (!profile) return;
    try {
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, { xp: increment(100), streak: increment(1) });
      toast({ title: "Elite Synchronization Complete", description: "+100 XP ACQUIRED" });
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#22c55e] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Scanning Elite Sectors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-32 pt-8 text-white">
      <Navbar />
      <main className="max-w-xl mx-auto p-4 space-y-6 pt-safe">
        {completed ? (
          <div className="text-center space-y-8 py-12 animate-in zoom-in">
             <div className="w-32 h-32 bg-[#22c55e]/10 rounded-[3rem] flex items-center justify-center mx-auto border-b-8 border-[#22c55e]/20 shadow-2xl">
               <ShieldCheck className="w-16 h-16 text-[#22c55e] animate-pulse" />
             </div>
             <div className="space-y-2">
               <h2 className="text-4xl font-black italic tracking-tighter text-[#22c55e]">MAZE CLEARED</h2>
               <p className="text-lg font-bold text-zinc-400">Elite Node Synchronized</p>
               <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 px-6 py-2 rounded-full border border-[#22c55e]/20 mt-4">
                 <Zap className="w-5 h-5 text-[#22c55e] fill-[#22c55e]" />
                 <span className="text-lg font-black text-[#22c55e]">+100 XP EARNED</span>
               </div>
             </div>
             <Button onClick={startMaze} className="lingua-button lingua-button-primary h-18 w-full text-xl shadow-xl">ENTER NEW MAZE</Button>
             <Link href="/games" className="block text-xs font-black text-zinc-500 uppercase hover:text-[#22c55e]">Exit Sector</Link>
          </div>
        ) : failed ? (
          <div className="text-center space-y-8 py-12 animate-in fade-in">
             <div className="w-32 h-32 bg-red-500/10 rounded-[3rem] flex items-center justify-center mx-auto border-b-8 border-red-500/20 shadow-2xl">
               <AlertTriangle className="w-16 h-16 text-red-500" />
             </div>
             <div className="space-y-2">
               <h2 className="text-4xl font-black italic tracking-tighter text-red-500">SECTOR LOST</h2>
               <p className="text-lg font-bold text-zinc-400">Navigation Error Detected</p>
             </div>
             <Button onClick={startMaze} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-xl">RETRY MAZE</Button>
             <Link href="/games" className="block text-xs font-black text-zinc-500 uppercase hover:text-red-500">Abort Mission</Link>
          </div>
        ) : (
          <div className="space-y-6">
            <header className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-xl">
               <div className="flex items-center gap-2">
                 <Compass className="w-5 h-5 text-[#22c55e]" />
                 <span className="text-xs font-black tracking-widest text-[#22c55e]">SECTOR {currentIndex + 1}/5</span>
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1 bg-[#22c55e]/10 rounded-full">
                 <Zap className="w-3 h-3 text-[#22c55e]" />
                 <span className="text-[10px] font-black text-[#22c55e]">ELITE REWARD</span>
               </div>
            </header>

            <div className="bg-white/5 border-2 border-white/5 p-8 rounded-[2.5rem] text-center space-y-4 shadow-inner">
               <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.5em]">Cryptic Decryption Required:</p>
               <h2 className="text-2xl font-black italic leading-tight text-white px-2">
                 "{riddles[currentIndex]?.riddle}"
               </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
               {riddles[currentIndex]?.options.map((opt: string) => (
                 <button
                  key={opt}
                  onClick={() => handleChoice(opt)}
                  disabled={!!selected}
                  className={cn(
                    "h-16 rounded-2xl border-2 font-black text-lg transition-all px-6 text-left flex justify-between items-center group",
                    selected === opt 
                      ? (opt === riddles[currentIndex].correct ? "bg-[#22c55e] border-[#22c55e] text-zinc-950" : "bg-red-600 border-red-600 text-white")
                      : (selected && opt === riddles[currentIndex].correct ? "border-[#22c55e] text-[#22c55e]" : "bg-white/5 border-white/10 hover:border-[#22c55e]/40")
                  )}
                 >
                   <span>{opt}</span>
                   <Zap className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity", selected === opt && "opacity-100")} />
                 </button>
               ))}
            </div>

            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[#22c55e] transition-all duration-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
                 style={{ width: `${(currentIndex / 5) * 100}%` }}
               />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
