"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Volume2, 
  RefreshCw, 
  BrainCircuit, 
  SkipForward, 
  Zap, 
  Sparkles,
  Mic,
  PenTool,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Check,
  X,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Target,
  LayoutDashboard
} from "lucide-react";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getLanguageData, getSubjectData, getRandomItems, type WordEntry } from "@/lib/data-loader";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSearchParams, useRouter } from "next/navigation";
import { BottomNav } from '@/components/layout/BottomNav';

type LearnStep = 'view' | 'write' | 'speak' | 'quiz' | 'complete';

function LearnPageInternal() {
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subject');
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordBatch, setWordBatch] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<LearnStep>('view');
  
  const [writingInput, setWritingInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [writingCorrect, setWritingCorrect] = useState(false);
  const [speakingCorrect, setSpeakingCorrect] = useState(false);
  const [processingVerification, setProcessingVerification] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const langMap: Record<string, string> = {
      'English': 'en-US', 'Hindi': 'hi-IN', 'Punjabi': 'pa-IN',
      'Spanish': 'es-ES', 'French': 'fr-FR', 'German': 'de-DE',
      'Italian': 'it-IT', 'Japanese': 'ja-JP', 'Mandarin': 'zh-CN',
      'Sanskrit': 'hi-IN', 'Bhojpuri': 'hi-IN', 'Haryanvi': 'hi-IN'
    };
    const speechLang = langMap[profile?.targetLanguage || 'English'] || 'en-US';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const fetchBatch = useCallback(async (isInitial = false) => {
    if (!profile) return;
    if (isInitial) setLoading(true);
    
    try {
      let data;
      if (subjectId && profile.grade) {
        data = await getSubjectData(subjectId, profile.grade);
      } else {
        data = await getLanguageData(profile.targetLanguage);
      }

      if (!data || !data.words || data.words.length === 0) {
        setWordBatch([]);
        setLoading(false);
        return;
      }

      const learnedSet = new Set(profile.learnedWords?.map(w => w.word) || []);
      const availableWords = data.words.filter(w => !learnedSet.has(w.word));
      
      let batch: WordEntry[] = [];
      if (availableWords.length > 0) {
        batch = getRandomItems(availableWords, 10);
      } else {
        batch = getRandomItems(data.words, 10);
      }
      
      setWordBatch(batch);
      setCurrentWordIndex(0);
      resetState();
    } catch (err) {
      toast({ title: "Sector Sync Failed", variant: "destructive" });
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [profile, subjectId, toast]);

  const resetState = () => {
    setStep('view');
    setWritingInput("");
    setWritingCorrect(false);
    setSpeakingCorrect(false);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSelected(null);
  };

  useEffect(() => {
    if (!authLoading && profile) {
      fetchBatch(true);
    }
  }, [authLoading, profile?.targetLanguage, profile?.grade, fetchBatch]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const target = wordBatch[currentWordIndex]?.word.toLowerCase().trim();
        
        if (transcript.includes(target) || target.includes(transcript)) {
          setSpeakingCorrect(true);
        } else {
          toast({ title: "Vocal Mismatch", description: `You said: "${transcript}"`, variant: "destructive" });
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [wordBatch, currentWordIndex, toast]);

  const startLocalQuiz = async () => {
    const currentWord = wordBatch[currentWordIndex];
    if (!currentWord || !profile) return;

    try {
      let data;
      if (subjectId && profile.grade) {
        data = await getSubjectData(subjectId, profile.grade);
      } else {
        data = await getLanguageData(profile.targetLanguage);
      }

      const others = data.words.filter(w => w.word !== currentWord.word);
      
      const qs = [
        {
          question: `What is the meaning of "${currentWord.word}"?`,
          options: [currentWord.meaning, ...getRandomItems(others, 3).map(o => o.meaning)].sort(() => Math.random() - 0.5),
          correctAnswer: currentWord.meaning
        },
        ...getRandomItems(others, 4).map(w => ({
          question: `Which concept matches "${w.meaning}"?`,
          options: [w.word, ...getRandomItems(data.words.filter(x => x.word !== w.word), 3).map(o => o.word)].sort(() => Math.random() - 0.5),
          correctAnswer: w.word
        }))
      ].sort(() => Math.random() - 0.5);

      setQuizQuestions(qs);
      setStep('quiz');
    } catch (err) {
      toast({ title: "Quiz Core Failure" });
    }
  };

  const handleQuizAnswer = (option: string) => {
    if (quizSelected) return;
    setQuizSelected(option);
    const correct = option === quizQuestions[quizIndex].correctAnswer;
    if (correct) setQuizScore(s => s + 1);

    setTimeout(() => {
      if (quizIndex + 1 < quizQuestions.length) {
        setQuizIndex(i => i + 1);
        setQuizSelected(null);
      } else {
        finalizeMastery(quizScore + (correct ? 1 : 0) >= 4);
      }
    }, 800);
  };

  const finalizeMastery = async (passed: boolean) => {
    if (!passed) {
      toast({ title: "Mastery Failed", description: "You need 4/5 correct to pass.", variant: "destructive" });
      resetState();
      return;
    }

    if (!profile || !wordBatch[currentWordIndex]) return;
    const wordData = wordBatch[currentWordIndex];
    setProcessingVerification(true);

    try {
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, {
        xp: increment(50),
        learnedWords: arrayUnion({
          word: wordData.word,
          meaning: wordData.meaning,
          example: wordData.example,
          date: new Date().toISOString(),
          subject: subjectId || 'Language'
        })
      });

      toast({ title: "Node Mastered", description: "+50 XP Acquired." });
      
      if (currentWordIndex + 1 < wordBatch.length) {
        setCurrentWordIndex(prev => prev + 1);
        resetState();
      } else {
        fetchBatch();
      }
    } catch (err) {
      toast({ title: "Sync failed", variant: "destructive" });
    } finally {
      setProcessingVerification(false);
    }
  };

  const handleVerifyWriting = () => {
    const target = wordBatch[currentWordIndex]?.word.trim();
    if (writingInput.trim() === target) {
      setWritingCorrect(true);
    } else {
      toast({ title: "Syntax Error", variant: "destructive" });
    }
  };

  const handleSkipNode = () => {
    if (currentWordIndex + 1 < wordBatch.length) {
      setCurrentWordIndex(prev => prev + 1);
      resetState();
    } else {
      fetchBatch();
    }
  };

  const handleSwitchToQuizMode = () => {
    const path = subjectId ? `/quiz?subject=${subjectId}` : `/quiz`;
    router.push(path);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background pb-28 pt-20">
      <Navbar />
      
      <main className="lg:hidden max-w-2xl mx-auto p-4 flex flex-col min-h-[70vh]">
        <header className="mb-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-primary shadow-lg border border-white/10">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                Node {wordBatch.length > 0 ? `${currentWordIndex + 1}/${wordBatch.length}` : 'Scanning'}
              </p>
              <h3 className="text-xs font-black text-primary uppercase mt-1">
                {subjectId ? `${subjectId.toUpperCase()} G-${profile?.grade}` : `${profile?.targetLanguage} Hub`}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleSwitchToQuizMode} 
              className="rounded-xl h-9 text-[9px] font-black uppercase tracking-widest border-2 border-primary/20 text-primary hover:bg-primary/10"
            >
              QUIZ MODE
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSkipNode} 
              className="rounded-xl h-9 text-[9px] font-black uppercase tracking-widest border border-muted hover:bg-muted active:scale-95"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </Button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-[2.5rem]" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
              </div>
            </div>
          ) : wordBatch.length > 0 ? (
            <motion.div 
              key={`${wordBatch[currentWordIndex].word}-${step}`}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              className="space-y-6 gpu-accelerated"
            >
              {step === 'view' && (
                <div className="space-y-6">
                  <div className="lingua-card p-8 bg-white border-b-8 shadow-2xl relative">
                    <div className="absolute top-4 right-4">
                       <button onClick={() => speak(wordBatch[currentWordIndex].word)} className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center active:scale-90 transition-all">
                        <Volume2 className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-3 pt-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic text-zinc-900 leading-tight">
                          {wordBatch[currentWordIndex].word}
                        </h2>
                        <p className="text-xl font-bold text-primary italic">"{wordBatch[currentWordIndex].meaning}"</p>
                    </div>

                    <div className="mt-8 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                       <div className="terminal-label bg-primary text-white border-none mb-3 py-1">
                         <Zap className="w-3 h-3 fill-white" />
                         <span className="text-[8px]">CONTEXT</span>
                       </div>
                       <p className="text-base font-medium italic text-zinc-700">"{wordBatch[currentWordIndex].example}"</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={startLocalQuiz}
                      className="w-full lingua-button lingua-button-primary h-18 text-lg shadow-xl"
                    >
                      <Trophy className="mr-3 w-6 h-6" /> QUICK MASTERY QUIZ
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={() => setStep('write')} variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black text-xs">
                        <PenTool className="mr-2 w-4 h-4" /> SCRIBE
                      </Button>
                      <Button onClick={() => setStep('speak')} variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black text-xs">
                        <Mic className="mr-2 w-4 h-4" /> ORATOR
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'write' && (
                <div className="space-y-6">
                  <div className="lingua-card p-6 bg-white border-b-8 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                        <PenTool className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-black italic uppercase">Script Sync</h2>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-center text-zinc-900">{wordBatch[currentWordIndex].word}</h3>
                      <Input 
                        value={writingInput}
                        onChange={(e) => setWritingInput(e.target.value)}
                        placeholder="Type script here..."
                        className="h-16 rounded-2xl border-2 text-xl font-bold text-center bg-muted/20"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyWriting()}
                      />
                      {writingCorrect ? (
                        <div className="flex items-center justify-center gap-2 text-primary font-black text-sm uppercase">
                          <ShieldCheck className="w-5 h-5" /> VALIDATED
                        </div>
                      ) : (
                        <Button onClick={handleVerifyWriting} className="w-full h-12 bg-zinc-900 text-white rounded-xl font-black text-[10px]">
                          VERIFY SCRIPT
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button disabled={!writingCorrect} onClick={() => setStep('speak')} className="w-full h-18 rounded-[2rem] lingua-button lingua-button-primary text-xl shadow-xl">
                    CONTINUE <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}

              {step === 'speak' && (
                <div className="space-y-6">
                  <div className="lingua-card p-8 bg-zinc-900 text-white border-b-8 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-2">AUDITORY LINK</p>
                    <h2 className="text-4xl font-black italic mb-10">{wordBatch[currentWordIndex].word}</h2>
                    <div className="flex flex-col items-center gap-4">
                      <button 
                        onClick={() => { recognitionRef.current?.start(); setIsListening(true); }}
                        disabled={isListening || speakingCorrect}
                        className={cn(
                          "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl border-b-8",
                          isListening ? "bg-red-50 animate-pulse border-red-700" : 
                          speakingCorrect ? "bg-primary border-primary-foreground/20" : "bg-white text-zinc-900 border-zinc-300"
                        )}
                      >
                        {speakingCorrect ? <ShieldCheck className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
                      </button>
                    </div>
                  </div>
                  <Button disabled={!speakingCorrect || processingVerification} onClick={() => finalizeMastery(true)} className="w-full lingua-button lingua-button-primary h-18 text-lg shadow-xl">
                    {processingVerification ? <RefreshCw className="animate-spin mr-3" /> : <Sparkles className="w-6 h-6 mr-3" />}
                    FINALIZE MASTERY (+50 XP)
                  </Button>
                </div>
              )}

              {step === 'quiz' && quizQuestions[quizIndex] && (
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mastery Bout {quizIndex + 1}/5</span>
                        <span className="text-[10px] font-black text-primary uppercase">{quizScore} Score</span>
                      </div>
                      <Progress value={((quizIndex + 1) / 5) * 100} className="h-2 bg-muted rounded-full" />
                   </div>
                   <div className="lingua-card p-8 bg-white border-b-8 text-center min-h-[220px] flex flex-col justify-center shadow-xl">
                      <h2 className="text-2xl font-black italic leading-tight text-zinc-900">
                        {quizQuestions[quizIndex].question}
                      </h2>
                   </div>
                   <div className="grid grid-cols-1 gap-2">
                      {quizQuestions[quizIndex].options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => handleQuizAnswer(opt)}
                          disabled={!!quizSelected}
                          className={cn(
                            "lingua-button h-16 px-6 font-black border-2 transition-all text-sm",
                            quizSelected === opt 
                              ? (opt === quizQuestions[quizIndex].correctAnswer ? "bg-primary text-white" : "bg-destructive text-white")
                              : (quizSelected && opt === quizQuestions[quizIndex].correctAnswer ? "bg-primary/20 border-primary" : "bg-white border-muted shadow-sm")
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-20 space-y-6">
              <div className="w-20 h-20 bg-zinc-100 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black italic uppercase">Sector Synchronized</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                   The requested scholarly node is currently being processed or the curriculum is empty.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => fetchBatch()} className="lingua-button lingua-button-primary h-14">RE-SCAN SECTOR</Button>
                 <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Return to Hub</Button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <main className="hidden lg:grid grid-cols-[300px_1fr] gap-8 max-w-[1600px] mx-auto p-8 mt-16 min-h-[calc(100vh-64px)] pb-10">
        <aside className="space-y-6 scrollbar-hide pb-8">
           <section className="lingua-card !bg-white/90 p-8 border-b-8 border-green-500/20 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                 <Target className="w-5 h-5 text-[#22c55e]" />
                 <h3 className="text-sm font-black uppercase tracking-widest italic text-zinc-900">Mastery Feed</h3>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Batch</p>
                 <div className="space-y-2">
                    {wordBatch.map((w, i) => (
                      <div key={i} className={cn(
                        "p-3 rounded-xl border flex items-center justify-between group transition-all",
                        i === currentWordIndex ? "bg-green-50 border-green-200" : "bg-white border-zinc-100 opacity-60"
                      )}>
                        <p className="font-black text-xs italic text-zinc-900">{w.word}</p>
                        {i < currentWordIndex && <Check className="w-3 h-3 text-[#22c55e]" />}
                      </div>
                    ))}
                 </div>
              </div>
              <Button onClick={handleSwitchToQuizMode} className="w-full h-12 bg-zinc-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                 ENTER QUIZ MODE
              </Button>
           </section>
        </aside>

        <section className="bg-white/40 backdrop-blur-xl rounded-[3.5rem] border border-white/40 shadow-2xl overflow-hidden flex flex-col relative">
           <header className="h-20 bg-zinc-900 text-white px-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-[#22c55e]" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black italic tracking-tighter">Academic Hub: {subjectId?.toUpperCase() || "General"}</h2>
                    <p className="text-[9px] font-black text-[#22c55e] uppercase tracking-[0.3em]">L0 Global Curriculum</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#22c55e]">
                    Node {currentWordIndex + 1}/{wordBatch.length}
                 </div>
                 <Button variant="ghost" onClick={handleSkipNode} className="text-white hover:bg-white/10 font-black text-[9px] uppercase tracking-widest">
                    SKIP NODE
                 </Button>
              </div>
           </header>

           <div className="flex-1 p-12 scrollbar-hide">
              <AnimatePresence mode="wait">
                 {loading ? (
                   <div className="max-w-3xl mx-auto space-y-8">
                      <Skeleton className="h-96 w-full rounded-[3rem]" />
                      <Skeleton className="h-20 w-full rounded-2xl" />
                   </div>
                 ) : wordBatch[currentWordIndex] ? (
                    <motion.div 
                      key={`${wordBatch[currentWordIndex].word}-web-${step}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="max-w-4xl mx-auto space-y-10 gpu-accelerated"
                    >
                       {step === 'view' && (
                         <div className="space-y-10">
                            <div className="grid grid-cols-[1fr_350px] gap-8">
                               <div className="lingua-card bg-white p-12 border-b-[12px] border-green-500/10 shadow-2xl space-y-8">
                                  <div className="flex justify-between items-start">
                                     <h2 className="text-7xl font-black italic tracking-tighter text-zinc-900 leading-none">{wordBatch[currentWordIndex].word}</h2>
                                     <button onClick={() => speak(wordBatch[currentWordIndex].word)} className="w-20 h-20 bg-green-50 text-[#22c55e] rounded-3xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg border border-green-100">
                                        <Volume2 className="w-10 h-10" />
                                     </button>
                                  </div>
                                  <p className="text-3xl font-bold text-zinc-400 italic">"{wordBatch[currentWordIndex].meaning}"</p>
                                  <div className="pt-8 border-t border-zinc-100 space-y-4">
                                     <div className="terminal-label bg-[#22c55e] text-white border-none">
                                        <Zap className="w-3 h-3 fill-white" />
                                        <span>CONTEXTUAL NODE</span>
                                     </div>
                                     <p className="text-2xl font-medium text-zinc-700 leading-relaxed italic">"{wordBatch[currentWordIndex].example}"</p>
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <button onClick={startLocalQuiz} className="w-full h-32 bg-gradient-to-br from-[#22c55e] to-emerald-700 text-white rounded-[2.5rem] p-8 text-left group overflow-hidden relative shadow-2xl border-b-[10px] border-black/10">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
                                     <Trophy className="w-8 h-8 mb-4 opacity-80" />
                                     <p className="text-xl font-black italic uppercase leading-none">Mastery<br/>Quiz</p>
                                  </button>
                                  <div className="grid grid-cols-1 gap-4">
                                     <button onClick={() => setStep('write')} className="h-24 bg-zinc-900 text-white rounded-[2rem] flex items-center gap-6 px-8 hover:bg-zinc-800 transition-all border-b-8 border-white/5 shadow-xl">
                                        <PenTool className="w-8 h-8 text-[#22c55e]" />
                                        <span className="font-black text-lg italic uppercase tracking-widest">Scribe Module</span>
                                     </button>
                                     <button onClick={() => setStep('speak')} className="h-24 bg-white border-2 border-zinc-100 rounded-[2rem] flex items-center gap-6 px-8 hover:border-[#22c55e]/30 transition-all border-b-8 shadow-xl">
                                        <Mic className="w-8 h-8 text-blue-500" />
                                        <span className="font-black text-lg italic uppercase tracking-widest text-zinc-900">Orator Module</span>
                                     </button>
                                  </div>
                               </div>
                            </div>
                         </div>
                       )}

                       {(step === 'write' || step === 'speak' || step === 'quiz') && (
                          <div className="max-w-2xl mx-auto space-y-8 py-10">
                             {step === 'write' && (
                                <div className="space-y-8">
                                   <div className="lingua-card bg-white p-12 border-b-[12px] shadow-2xl text-center space-y-8">
                                      <h3 className="text-6xl font-black italic text-zinc-900">{wordBatch[currentWordIndex].word}</h3>
                                      <Input 
                                        value={writingInput}
                                        onChange={(e) => setWritingInput(e.target.value)}
                                        placeholder="Synchronize script..."
                                        className="h-24 rounded-[2rem] border-[4px] border-zinc-100 text-4xl font-black text-center focus:border-[#22c55e] transition-all bg-muted/5 shadow-inner"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyWriting()}
                                      />
                                      {writingCorrect ? (
                                         <div className="flex items-center justify-center gap-3 text-[#22c55e] font-black text-2xl uppercase italic"><ShieldCheck className="w-8 h-8" /> NODE VALIDATED</div>
                                      ) : (
                                         <Button onClick={handleVerifyWriting} className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg">VERIFY SCRIPT</Button>
                                      )}
                                   </div>
                                   <Button disabled={!writingCorrect} onClick={() => setStep('speak')} className="w-full h-24 rounded-[2.5rem] lingua-button lingua-button-primary text-3xl shadow-2xl">CONTINUE TO ORATOR <ArrowRight className="ml-3 w-8 h-8" /></Button>
                                </div>
                             )}

                             {step === 'speak' && (
                                <div className="space-y-8">
                                   <div className="lingua-card p-12 bg-zinc-900 text-white border-b-[12px] text-center relative overflow-hidden shadow-2xl">
                                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/10 rounded-full blur-3xl" />
                                      <p className="text-sm font-black uppercase tracking-[0.4em] text-[#22c55e] mb-4">AUDITORY LINK</p>
                                      <h2 className="text-7xl font-black italic mb-16">{wordBatch[currentWordIndex].word}</h2>
                                      <div className="flex flex-col items-center gap-6">
                                        <button 
                                          onClick={() => { recognitionRef.current?.start(); setIsListening(true); }}
                                          disabled={isListening || speakingCorrect}
                                          className={cn(
                                            "w-40 h-40 rounded-full flex items-center justify-center transition-all shadow-2xl border-b-[12px]",
                                            isListening ? "bg-red-50 animate-pulse border-red-700 text-red-600" : 
                                            speakingCorrect ? "bg-[#22c55e] border-[#16a34a] text-white" : "bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50"
                                          )}
                                        >
                                          {speakingCorrect ? <ShieldCheck className="w-20 h-20" /> : <Mic className="w-20 h-20" />}
                                        </button>
                                        {!speakingCorrect && !isListening && <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Click to Speak</p>}
                                      </div>
                                   </div>
                                   <Button disabled={!speakingCorrect || processingVerification} onClick={() => finalizeMastery(true)} className="w-full lingua-button lingua-button-primary h-24 text-3xl shadow-2xl rounded-[2.5rem]">
                                      {processingVerification ? <RefreshCw className="animate-spin mr-4 w-8 h-8" /> : <Sparkles className="w-8 h-8 mr-4" />}
                                      FINALIZE MASTERY (+50 XP)
                                   </Button>
                                </div>
                             )}

                             {step === 'quiz' && quizQuestions[quizIndex] && (
                                <div className="space-y-8">
                                   <div className="space-y-3">
                                      <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mastery Bout {quizIndex + 1}/5</span>
                                        <span className="text-xs font-black text-[#22c55e] uppercase">{quizScore} Score</span>
                                      </div>
                                      <Progress value={((quizIndex + 1) / 5) * 100} className="h-3 bg-muted rounded-full" />
                                   </div>
                                   <div className="lingua-card p-12 bg-white border-b-[12px] text-center min-h-[300px] flex flex-col justify-center shadow-2xl">
                                      <h2 className="text-4xl font-black italic leading-tight text-zinc-900">
                                        {quizQuestions[quizIndex].question}
                                      </h2>
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                      {quizQuestions[quizIndex].options.map((opt) => (
                                        <button
                                          key={opt}
                                          onClick={() => handleQuizAnswer(opt)}
                                          disabled={!!quizSelected}
                                          className={cn(
                                            "lingua-button h-24 px-8 font-black border-4 transition-all text-xl rounded-[2rem]",
                                            quizSelected === opt 
                                              ? (opt === quizQuestions[quizIndex].correctAnswer ? "bg-[#22c55e] text-white border-[#16a34a]" : "bg-red-500 text-white border-red-700")
                                              : (quizSelected && opt === quizQuestions[quizIndex].correctAnswer ? "bg-green-50 border-[#22c55e]" : "bg-white border-zinc-200 shadow-xl hover:border-zinc-300 hover:-translate-y-1")
                                          )}
                                        >
                                          {opt}
                                        </button>
                                      ))}
                                   </div>
                                </div>
                             )}
                          </div>
                       )}
                    </motion.div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-40 gap-8">
                       <div className="w-32 h-32 bg-zinc-50 rounded-[3rem] flex items-center justify-center shadow-inner">
                          <Sparkles className="w-16 h-16 text-zinc-200" />
                       </div>
                       <h2 className="text-4xl font-black italic text-zinc-300">CURRICULUM SYNC REQUIRED</h2>
                       <Button onClick={() => fetchBatch()} className="lingua-button lingua-button-primary px-12 h-20 text-2xl">INITIATE RE-SCAN</Button>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Initializing Terminal...</p>
      </div>
    }>
      <LearnPageInternal />
    </Suspense>
  );
}




