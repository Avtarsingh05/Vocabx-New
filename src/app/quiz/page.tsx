"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, X, Trophy, ArrowRight, BrainCircuit, Star, RefreshCw, SkipForward, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getLanguageData, getSubjectData, getRandomItems, type QuizEntry } from "@/lib/data-loader";
import { useSearchParams, useRouter } from "next/navigation";

function QuizPageInternal() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subject');
  
  const [questions, setQuestions] = useState<QuizEntry[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const startQuiz = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      let data;
      if (subjectId && profile.grade) {
        data = await getSubjectData(subjectId, profile.grade);
      } else {
        data = await getLanguageData(profile.targetLanguage);
      }

      if (!data || !data.words || data.words.length === 0) {
        throw new Error("Sector curriculum is currently offline.");
      }

      const nodesForQuiz = getRandomItems(data.words, 10);
      const dynamicQuizzes = nodesForQuiz.map(w => {
        const others = data.words.filter(x => x.word !== w.word);
        return {
          question: subjectId ? `In ${subjectId}, what is the definition of "${w.word}"?` : `What is the meaning of "${w.word}"?`,
          options: [w.meaning, ...getRandomItems(others, 3).map(x => x.meaning)].sort(() => 0.5 - Math.random()),
          correctAnswer: w.meaning
        };
      });

      setQuestions(dynamicQuizzes.slice(0, 10));
      setCurrentIdx(0);
      setScore(0);
      setCompleted(false);
      setSelected(null);
    } catch (err: any) {
      toast({ title: "Quiz Assembly Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && profile) startQuiz();
  }, [authLoading, profile?.id, subjectId]);

  const handleSelect = (option: string) => {
    if (selected !== null) return;
    setSelected(option);
    if (option === questions[currentIdx].correctAnswer) setScore(s => s + 1);
  };

  const next = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    } else {
      setCompleted(true);
      if (profile) {
        try {
          const userRef = doc(db, "users", profile.id);
          await updateDoc(userRef, { xp: increment(score * 15), streak: increment(1) });
          toast({ title: "Sync Complete", description: `+${score * 15} XP Acquired.` });
        } catch (e) {}
      }
    }
  };

  if (authLoading) return null;

  const current = questions[currentIdx];

  return (
    <div className="min-h-screen bg-background pb-10 pt-8 pt-safe">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 flex flex-col justify-center min-h-[70vh]">
        {loading ? (
          <div className="text-center space-y-4">
             <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Assembling Logic Chain...</p>
          </div>
        ) : completed ? (
          <div className="text-center space-y-8 py-12 animate-in zoom-in">
             <div className="w-32 h-32 bg-primary/10 rounded-[3rem] flex items-center justify-center mx-auto border-b-8 border-primary/20 shadow-2xl">
               <Trophy className="w-16 h-16 text-primary animate-bounce" />
             </div>
             <div className="space-y-2">
               <h2 className="text-4xl font-black italic tracking-tighter uppercase">Subject Cleared</h2>
               <p className="text-xl font-bold text-muted-foreground">{score} / {questions.length} Logical Links Verified</p>
               <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-2 rounded-full border border-primary/20 mt-4">
                 <Star className="w-5 h-5 text-primary fill-primary" />
                 <span className="text-lg font-black text-primary">+{score * 15} XP ACCRUED</span>
               </div>
             </div>
             <div className="flex flex-col gap-3 pt-6">
                <Button onClick={startQuiz} className="lingua-button lingua-button-primary h-18 w-full text-xl shadow-xl">RE-INITIATE BOUT</Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Exit to Command Center
                </Button>
             </div>
          </div>
        ) : current ? (
          <div className="space-y-6">
            <header className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {subjectId ? `${subjectId.toUpperCase()} BOUT` : 'BOUT'} {currentIdx + 1} / {questions.length}
                </span>
                <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-primary text-xs font-black">{score * 15} XP</span>
                </div>
              </div>
              <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-4 rounded-full bg-zinc-100" />
            </header>

            <div className="lingua-card min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white border-b-[10px] shadow-2xl">
               <h2 className="text-2xl md:text-3xl font-black italic tracking-tight leading-tight mb-8">
                 {current.question}
               </h2>
               <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                  {current.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      disabled={selected !== null}
                      className={cn(
                        "lingua-button h-16 px-6 font-black border-2 transition-all text-sm",
                        selected === opt 
                          ? (opt === current.correctAnswer ? "bg-primary text-white border-primary-foreground/20" : "bg-destructive text-white border-destructive-foreground/20")
                          : (selected !== null && opt === current.correctAnswer ? "border-primary text-primary animate-pulse" : "bg-white border-muted shadow-sm hover:border-primary/40")
                      )}
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </div>

            {selected !== null && (
              <div className="animate-in slide-in-from-bottom flex flex-col gap-4">
                 <div className={cn("p-4 rounded-2xl flex items-center gap-4 border-b-4 shadow-lg", selected === current.correctAnswer ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", selected === current.correctAnswer ? "bg-primary" : "bg-destructive")}>
                       {selected === current.correctAnswer ? <Check className="text-white" /> : <X className="text-white" />}
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase italic">{selected === current.correctAnswer ? "LOGIC SYNCHRONIZED" : "NODE FAILURE"}</p>
                      {selected !== current.correctAnswer && <p className="text-[10px] font-bold opacity-70">Target: {current.correctAnswer}</p>}
                    </div>
                 </div>
                 <Button onClick={next} className="lingua-button lingua-button-primary h-16 text-lg shadow-xl shadow-primary/20">
                   {currentIdx + 1 === questions.length ? "COMPLETE SECTOR" : "NEXT BOUT"} <ArrowRight className="ml-2 w-6 h-6" />
                 </Button>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Booting Logic Hub...</p>
      </div>
    }>
      <QuizPageInternal />
    </Suspense>
  );
}
