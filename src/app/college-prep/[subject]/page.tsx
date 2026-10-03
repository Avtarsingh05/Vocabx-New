
"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Code2, 
  Terminal, 
  CheckCircle2, 
  Trophy, 
  ArrowRight, 
  RefreshCw, 
  SkipForward,
  BookOpen,
  FileCode,
  Zap,
  Layout,
  DatabaseZap
} from "lucide-react";
import { getCollegePrepData, type WordEntry, type QuizEntry, getRandomItems } from "@/lib/data-loader";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function CollegePrepModule({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params);
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<WordEntry[]>([]);
  const [currentNodeIdx, setCurrentNodeIdx] = useState(0);
  const [step, setStep] = useState<'study' | 'quiz' | 'complete'>('study');
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizEntry[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCollegePrepData(subject);
        if (data && data.words && data.words.length > 0) {
          setNodes(getRandomItems(data.words, Math.min(data.words.length, 10)));
          setQuizQuestions(getRandomItems(data.quizzes, Math.min(data.quizzes.length, 10)));
        }
      } catch (err) {
        toast({ title: "Sector Offline", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subject, toast]);

  const handleNextNode = () => {
    if (currentNodeIdx + 1 < nodes.length) {
      setCurrentNodeIdx(prev => prev + 1);
    } else {
      setStep('quiz');
    }
  };

  const handleQuizAnswer = (option: string) => {
    if (quizSelected) return;
    setQuizSelected(option);
    const correct = option === quizQuestions[quizIdx].correctAnswer;
    if (correct) setQuizScore(s => s + 1);

    setTimeout(() => {
      if (quizIdx + 1 < quizQuestions.length) {
        setQuizIdx(i => i + 1);
        setQuizSelected(null);
      } else {
        finishModule(quizScore + (correct ? 1 : 0));
      }
    }, 800);
  };

  const finishModule = async (finalScore: number) => {
    setStep('complete');
    if (!profile) return;
    const xp = finalScore * 15;
    
    try {
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, { 
        xp: increment(xp), 
        streak: increment(1) 
      });
      toast({ title: "Sync Complete", description: `+${xp} XP Acquired.` });
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Terminal className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Booting Kernel...</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-32 pt-20">
        <Navbar />
        <main className="max-w-2xl mx-auto p-8 flex flex-col items-center justify-center text-center space-y-6">
           <div className="w-24 h-24 bg-zinc-100 rounded-[2.5rem] flex items-center justify-center shadow-inner">
              <DatabaseZap className="w-12 h-12 text-zinc-400" />
           </div>
           <div className="space-y-2">
              <h1 className="text-2xl font-black italic uppercase tracking-tight">Sync Pending</h1>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                The technical nodes for <span className="text-indigo-600">"{subject}"</span> are currently being synchronized with the master terminal. Check back shortly.
              </p>
           </div>
           <Button onClick={() => window.history.back()} variant="outline" className="h-14 px-8 rounded-2xl font-black uppercase text-xs">Return to Hub</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-20 pt-safe pb-safe">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 flex flex-col min-h-[70vh]">
        <header className="mb-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-900 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-500 shadow-xl border border-white/10 shrink-0">
              <Code2 className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div className="overflow-hidden">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                {step === 'study' ? `Node ${currentNodeIdx + 1}/${nodes.length}` : `Bout ${quizIdx + 1}/${quizQuestions.length}`}
              </p>
              <h3 className="text-lg font-black text-zinc-900 uppercase italic mt-1 truncate">
                {subject.toUpperCase()} Terminal
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100 shrink-0">
             <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
             <span className="text-[9px] font-black text-indigo-600 uppercase">{profile?.xp} XP</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {step === 'study' && nodes[currentNodeIdx] && (
            <motion.div 
              key={`study-${currentNodeIdx}`}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6 gpu-accelerated"
            >
              <div className="lingua-card p-6 md:p-8 bg-white border-b-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-zinc-900 text-white text-[7px] font-black uppercase tracking-widest rounded-md">Topic</div>
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Programming Paradigm</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic text-zinc-900 leading-tight">
                    {nodes[currentNodeIdx].word}
                  </h2>
                  <p className="text-base md:text-lg font-bold text-zinc-600 leading-relaxed">
                    {nodes[currentNodeIdx].meaning}
                  </p>
                </div>

                <div className="mt-6 md:mt-8 bg-zinc-900 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-b-4 border-indigo-500/20 shadow-2xl font-mono relative overflow-x-auto">
                   <div className="absolute top-4 right-6 flex gap-1.5 hidden md:flex">
                      <div className="w-2 h-2 rounded-full bg-red-500/50" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                      <div className="w-2 h-2 rounded-full bg-green-500/50" />
                   </div>
                   <div className="text-indigo-400 text-[7px] md:text-[8px] font-black mb-3 md:mb-4 uppercase tracking-[0.3em]">Code Context</div>
                   <p className="text-xs md:text-sm font-medium text-white opacity-90 whitespace-pre-wrap leading-relaxed">
                    {nodes[currentNodeIdx].example}
                   </p>
                </div>
              </div>

              <Button 
                onClick={handleNextNode}
                className="w-full h-16 md:h-18 rounded-2xl md:rounded-[2rem] lingua-button lingua-button-primary text-lg md:text-xl shadow-2xl shadow-indigo-500/20 active:scale-95"
              >
                {currentNodeIdx + 1 === nodes.length ? "START MASTERY QUIZ" : "NEXT KNOWLEDGE NODE"} 
                <ArrowRight className="ml-3 w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </motion.div>
          )}

          {step === 'quiz' && quizQuestions[quizIdx] && (
            <motion.div 
              key={`quiz-${quizIdx}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6 gpu-accelerated"
            >
               <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Technical Assessment {quizIdx + 1}/{quizQuestions.length}</span>
                    <span className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase">{quizScore} Score</span>
                  </div>
                  <Progress value={((quizIdx + 1) / quizQuestions.length) * 100} className="h-2 bg-muted rounded-full" />
               </div>

               <div className="lingua-card p-8 md:p-10 bg-white border-b-8 text-center min-h-[200px] md:min-h-[250px] flex flex-col justify-center shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tight leading-tight text-zinc-900">
                    {quizQuestions[quizIdx].question}
                  </h2>
               </div>

               <div className="grid grid-cols-1 gap-2 md:gap-3">
                  {quizQuestions[quizIdx].options.map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => handleQuizAnswer(opt)}
                      disabled={!!quizSelected}
                      className={cn(
                        "lingua-button h-14 md:h-16 px-4 md:px-6 font-black border-2 transition-all text-xs md:text-sm shadow-md",
                        quizSelected === opt 
                          ? (opt === quizQuestions[quizIdx].correctAnswer ? "!bg-primary !text-white border-primary-foreground/20" : "!bg-destructive !text-white border-destructive-foreground/20")
                          : (quizSelected && opt === quizQuestions[quizIdx].correctAnswer ? "border-primary text-primary animate-pulse" : "bg-white border-muted")
                      )}
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 py-10 md:py-12 gpu-accelerated"
            >
               <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 rounded-3xl md:rounded-[3rem] flex items-center justify-center mx-auto border-b-[8px] md:border-b-[10px] border-indigo-500/20 shadow-2xl">
                 <Trophy className="w-12 h-12 md:w-16 md:h-16 text-indigo-500 animate-bounce" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-zinc-900 uppercase">Terminal Cleared</h2>
                 <p className="text-lg md:text-xl font-bold text-muted-foreground">{quizScore} / {quizQuestions.length} Knowledge Points</p>
                 <div className="inline-flex items-center gap-2 bg-indigo-50 px-6 py-2 rounded-full border border-indigo-100 mt-4 shadow-xl">
                   <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                   <span className="text-base md:text-lg font-black text-indigo-600">+{quizScore * 15} XP EARNED</span>
                 </div>
               </div>
               <div className="flex flex-col gap-3 pt-6">
                 <Button onClick={() => window.location.reload()} className="h-16 rounded-2xl md:rounded-[2rem] lingua-button lingua-button-primary text-xl shadow-xl active:scale-95">RE-INITIATE SYNC</Button>
                 <Button variant="ghost" onClick={() => window.location.href = '/college-prep'} className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exit to Prep Hub</Button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
