"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  Zap, 
  Play, 
  CheckCircle2, 
  ChevronLeft, 
  Loader2, 
  Code2, 
  ShieldCheck, 
  AlertCircle,
  Trophy,
  History
} from "lucide-react";
import { evaluateCode } from "@/ai/flows/evaluate-code";
import { getArenaQuestions, type ArenaQuestion } from "@/lib/data-loader";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

export default function CodeArenaEditor({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<ArenaQuestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const data = await getArenaQuestions();
      setQuestions(data);
      if (data[0]?.starterCode[lang]) {
        setCode(data[0].starterCode[lang]);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [lang]);

  const handleRun = async () => {
    if (!code.trim() || verifying) return;
    setVerifying(true);
    setResult(null);
    
    try {
      const res = await evaluateCode({
        language: lang,
        challenge: questions[activeIdx].title,
        code,
        requirements: questions[activeIdx].requirements
      });
      
      setResult(res);
      
      if (res.isCorrect && profile) {
        const userRef = doc(db, "users", profile.id);
        await updateDoc(userRef, { xp: increment(100) });
        toast({ title: "Challenge Mastered", description: "+100 XP Accrued." });
      }
    } catch (err) {
      toast({ title: "Evaluation Failed", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const selectChallenge = (idx: number) => {
    setActiveIdx(idx);
    setCode(questions[idx].starterCode[lang] || "// Start coding...");
    setResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Terminal className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Booting Arena Kernel...</p>
      </div>
    );
  }

  const activeQ = questions[activeIdx];

  return (
    <div className="min-h-screen bg-background pt-20 pb-10">
      <Navbar />
      
      {/* MOBILE COMBAT VIEW */}
      <main className="lg:hidden p-4 space-y-4">
        <header className="flex items-center gap-3">
           <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-xl h-10 w-10">
             <ChevronLeft className="w-6 h-6" />
           </Button>
           <h1 className="text-xl font-black italic uppercase">{lang} Arena</h1>
        </header>

        <section className="lingua-card bg-white p-6 border-b-8 shadow-xl space-y-4">
           <div className="flex justify-between items-center">
             <span className="text-[10px] font-black bg-zinc-900 text-white px-2 py-0.5 rounded uppercase">{activeQ.difficulty}</span>
             <span className="text-[9px] font-black text-primary uppercase">100 XP Reward</span>
           </div>
           <h2 className="text-2xl font-black italic tracking-tighter text-zinc-900">{activeQ.title}</h2>
           <p className="text-sm font-bold text-zinc-500 leading-relaxed">{activeQ.description}</p>
        </section>

        <div className="space-y-2">
           <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">IDE Input</p>
           <div className="relative group">
              <Textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] bg-zinc-900 text-green-400 font-mono text-sm rounded-3xl p-6 border-b-[8px] border-primary/20 focus:border-primary transition-all shadow-2xl"
                placeholder="// Logic here..."
              />
              <div className="absolute top-4 right-4 flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
           </div>
        </div>

        <Button 
          onClick={handleRun} 
          disabled={verifying} 
          className="w-full h-16 lingua-button lingua-button-primary text-lg shadow-xl"
        >
          {verifying ? <Loader2 className="animate-spin mr-3" /> : <Play className="mr-3 fill-white" />}
          EXECUTE LOGIC
        </Button>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn(
                "lingua-card border-b-8 p-6 space-y-4",
                result.isCorrect ? "bg-green-50 border-green-500/20" : "bg-red-50 border-red-500/20"
              )}
            >
               <div className="flex items-center gap-3">
                  {result.isCorrect ? <ShieldCheck className="w-6 h-6 text-primary" /> : <AlertCircle className="w-6 h-6 text-destructive" />}
                  <h3 className="font-black italic uppercase">{result.isCorrect ? "SYNCHRONIZED" : "LOGIC ERROR"}</h3>
               </div>
               <p className="text-sm font-bold text-zinc-700 leading-relaxed italic">"{result.feedback}"</p>
               <div className="bg-zinc-950 p-4 rounded-xl font-mono text-[10px] text-zinc-400">
                  <p className="text-[8px] uppercase font-black mb-2 text-zinc-600">Simulated Output</p>
                  {result.simulatedOutput}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* WEB TERMINAL IDE */}
      <main className="hidden lg:grid grid-cols-[350px_1fr_400px] gap-8 max-w-[1700px] mx-auto p-8 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* LEFT: Challenge Rail */}
        <aside className="space-y-6 overflow-y-auto scrollbar-hide pb-8">
           <section className="lingua-card !bg-white/90 p-8 border-b-8 border-primary/20 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                 <History className="w-5 h-5 text-primary" />
                 <h3 className="text-sm font-black uppercase tracking-widest italic">Challenge Index</h3>
              </div>
              <div className="space-y-3">
                 {questions.map((q, i) => (
                   <button
                    key={q.id}
                    onClick={() => selectChallenge(i)}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all text-left group hover:scale-[1.02]",
                      i === activeIdx ? "bg-primary text-white border-primary shadow-xl" : "bg-white border-zinc-100 hover:border-primary/40"
                    )}
                   >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[8px] font-black uppercase opacity-60">Level 0{i+1}</p>
                        <span className="text-[7px] font-black uppercase bg-white/20 px-1.5 py-0.5 rounded">{q.difficulty}</span>
                      </div>
                      <p className="font-black text-sm italic">{q.title}</p>
                   </button>
                 ))}
              </div>
           </section>
        </aside>

        {/* CENTER: IDE SECTOR */}
        <section className="flex flex-col gap-6 h-full overflow-hidden">
           <header className="flex justify-between items-end px-4">
              <div>
                 <h1 className="text-4xl font-black tracking-tighter italic uppercase text-zinc-900">{lang} Terminal</h1>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-1">L0 Neural Compiler</p>
              </div>
              <Button onClick={handleRun} disabled={verifying} className="lingua-button lingua-button-primary h-14 px-10 shadow-2xl">
                 {verifying ? <Loader2 className="animate-spin mr-3" /> : <Play className="mr-3 fill-white" />}
                 RUN LOGIC
              </Button>
           </header>

           <div className="flex-1 relative group rounded-[3.5rem] overflow-hidden shadow-3xl border-b-[12px] border-primary/20">
              <div className="absolute top-0 left-0 w-full h-12 bg-zinc-800 flex items-center px-8 gap-2 border-b border-white/5">
                 <div className="w-3 h-3 rounded-full bg-red-500" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500" />
                 <div className="w-3 h-3 rounded-full bg-green-500" />
                 <span className="ml-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">VocabX-IDE v1.2 // {lang}.main</span>
              </div>
              <Textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-zinc-950 text-green-400 font-mono text-xl p-16 pt-20 border-none focus-visible:ring-0 resize-none scrollbar-hide selection:bg-primary selection:text-zinc-900"
                spellCheck={false}
              />
           </div>
        </section>

        {/* RIGHT: DOCS & FEEDBACK */}
        <aside className="space-y-6 overflow-y-auto scrollbar-hide pb-8">
           <section className="lingua-card !bg-white/90 p-8 border-b-8 border-primary/20 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                 <Code2 className="w-5 h-5 text-primary" />
                 <h3 className="text-sm font-black uppercase tracking-widest italic">Problem Spec</h3>
              </div>
              <div className="space-y-4">
                 <h2 className="text-2xl font-black italic tracking-tighter text-zinc-900 leading-tight">{activeQ.title}</h2>
                 <p className="text-sm font-bold text-zinc-500 leading-relaxed italic">"{activeQ.description}"</p>
                 <div className="space-y-3 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Requirements:</p>
                    {activeQ.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                         <div className="w-2 h-2 rounded-full bg-primary" />
                         <p className="text-xs font-bold text-zinc-600">{req}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </section>

           <AnimatePresence mode="wait">
             {result ? (
               <motion.section 
                key="result-pane"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "lingua-card border-b-8 p-8 space-y-6 shadow-2xl",
                  result.isCorrect ? "bg-green-50 border-green-500/30" : "bg-red-50 border-red-500/30"
                )}
               >
                  <div className="flex items-center gap-4">
                     <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", result.isCorrect ? "bg-primary text-white" : "bg-destructive text-white")}>
                        {result.isCorrect ? <Trophy className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                     </div>
                     <div>
                        <p className="text-xl font-black italic uppercase leading-none">{result.isCorrect ? "MASTERED" : "RETRY LOGIC"}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Efficiency: {result.efficiencyScore}%</p>
                     </div>
                  </div>
                  <p className="text-base font-bold text-zinc-700 italic leading-relaxed">"{result.feedback}"</p>
                  <div className="bg-zinc-900 p-6 rounded-[2rem] border-b-4 border-white/5 font-mono text-xs text-zinc-400 shadow-inner">
                     <p className="text-[8px] font-black uppercase text-zinc-600 mb-4 tracking-[0.3em]">System Output Console</p>
                     {result.simulatedOutput}
                  </div>
               </motion.section>
             ) : (
               <section className="bg-zinc-900 text-white rounded-[2.5rem] p-8 space-y-4 border-b-[10px] border-primary/20 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <Terminal className="w-10 h-10 text-primary mb-4" />
                  <h4 className="text-xl font-black italic">Execution Console Ready</h4>
                  <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-widest">Write your code and press Run Logic to synchronize with the neural evaluator. Accuracy is paramount.</p>
               </section>
             )}
           </AnimatePresence>
        </aside>

      </main>
    </div>
  );
}
