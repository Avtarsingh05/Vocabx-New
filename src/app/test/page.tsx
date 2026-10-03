"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { generateMasteryTest, gradeMasteryTest } from "@/ai/flows/mastery-test";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldAlert, Trophy, ShieldCheck, Timer, AlertCircle, Loader2, RefreshCw, Lock, ChevronRight, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Script from "next/script";

export const maxDuration = 120;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function MasteryTestPage() {
  const { profile } = useAuth();
  const [test, setTest] = useState<any>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();

  const handleSecurityBreach = useCallback(() => {
    if (isTestStarted && !isGrading && !result && test) {
      setIsTestStarted(false);
      setTest(null);
      setCurrentAnswers({});
      toast({
        title: "Test Voided",
        description: "Focus lost or window switch detected. The exam has been terminated for security.",
        variant: "destructive",
      });
    }
  }, [isTestStarted, isGrading, result, test, toast]);

  useEffect(() => {
    if (!isTestStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) handleSecurityBreach();
    };
    const handleBlur = () => handleSecurityBreach();
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopyPaste = (e: ClipboardEvent) => e.preventDefault();

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopyPaste);
    window.addEventListener("paste", handleCopyPaste);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopyPaste);
      window.removeEventListener("paste", handleCopyPaste);
    };
  }, [isTestStarted, handleSecurityBreach]);

  const handlePayment = () => {
    if (!isScriptLoaded || !profile) {
      toast({ title: "Gateway Initializing", description: "Please wait a moment." });
      return;
    }

    const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_placeholder";

    const options = {
      key: RAZORPAY_KEY, 
      amount: 9900,
      currency: "INR",
      name: "VocabX Mastery",
      description: "Verification Fee for Global Scholar Certification",
      image: "https://picsum.photos/seed/vocabx/200",
      handler: function (response: any) {
        setHasPaid(true);
        toast({ title: "Payment Verified", description: "Exam node unlocked." });
      },
      prefill: {
        name: profile.name,
        email: profile.email,
      },
      theme: {
        color: "#56C91D",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const startTest = async () => {
    if (!profile || !hasPaid) return;
    setLoading(true);
    try {
      const data = await generateMasteryTest({
        targetLanguage: profile.targetLanguage,
        level: profile.level
      });
      setTest(data);
      setIsTestStarted(true);
      setResult(null);
      setCurrentAnswers({});
    } catch (err) {
      toast({ title: "Failed to load test", description: "Gemini is busy. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    if (!test || !profile) return;
    setIsGrading(true);
    try {
      const answersForGrading = test.questions.map((q: any, i: number) => ({
        type: q.type,
        question: q.type === 'fill-up' ? q.sentence : (q.question || q.prompt),
        userAnswer: currentAnswers[i] || "",
        correctAnswer: q.correctAnswer || "",
        marks: q.marks
      }));

      const gradeResult = await gradeMasteryTest({
        targetLanguage: profile.targetLanguage,
        answers: answersForGrading
      });

      setResult(gradeResult);
      setIsTestStarted(false);

      if (gradeResult.score >= 90) {
        await addDoc(collection(db, "certificationRequests"), {
          userId: profile.id,
          userName: profile.name,
          userEmail: profile.email,
          score: gradeResult.score,
          language: profile.targetLanguage,
          status: "pending",
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      toast({ title: "Grading session failed", variant: "destructive" });
    } finally {
      setIsGrading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-10 pt-14">
      <Navbar />
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsScriptLoaded(true)}
      />
      
      <main className="max-w-3xl mx-auto p-4 animate-in fade-in duration-500">
        {!isTestStarted && !result && (
          <div className="text-center space-y-6 py-4">
            <header className="space-y-3">
               <div className="w-16 h-16 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center mx-auto rotate-3 shadow-2xl">
                 <Lock className="w-6 h-6 text-primary" />
               </div>
               <h1 className="text-3xl font-black tracking-tighter italic">MASTERY EXAM</h1>
               <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Global Scholar Certification</p>
            </header>

            <div className="lingua-card bg-white p-6 space-y-6 max-w-sm mx-auto border-b-8">
              <div className="space-y-1">
                <p className="text-2xl font-black text-primary uppercase">{hasPaid ? "Unlocked" : "₹99 Verification"}</p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Scholarship Node Active</p>
              </div>
              <div className="space-y-3 text-left border-t border-muted pt-4">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Protocol:</p>
                <div className="flex gap-3 items-start">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-[10px] font-bold leading-tight">Focus required. Window switching terminates exam.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] font-bold leading-tight">Distinction certificate issued manually by admin.</p>
                </div>
              </div>

              {!hasPaid ? (
                <Button 
                  onClick={handlePayment} 
                  disabled={!isScriptLoaded}
                  className="w-full lingua-button lingua-button-primary h-16 text-xl shadow-xl"
                >
                  <CreditCard className="mr-2 w-6 h-6" /> PAY & UNLOCK
                </Button>
              ) : (
                <Button 
                  onClick={startTest} 
                  disabled={loading}
                  className="w-full lingua-button lingua-button-primary h-16 text-xl shadow-xl"
                >
                  {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "START EXAM"}
                </Button>
              )}
            </div>
          </div>
        )}

        {isTestStarted && test && (
          <div className="space-y-6 select-none">
            <header className="fixed top-0 left-0 right-0 h-12 bg-background/90 backdrop-blur-xl z-[60] border-b-2 border-primary/20 flex items-center justify-center px-4">
                <div className="max-w-3xl w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary">SECURE SESSION</span>
                  </div>
                  <div className="px-3 py-0.5 bg-muted rounded-full text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                    Node: {profile.id.slice(0, 4).toUpperCase()}
                  </div>
                </div>
            </header>

            <div className="pt-14 space-y-8">
              {test.questions.map((q: any, i: number) => (
                <div key={i} className="lingua-card bg-white p-6 space-y-4 animate-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Q{i+1} — {q.marks}M</span>
                    <span className="text-[7px] font-black bg-muted px-1.5 py-0.5 rounded uppercase">{q.type}</span>
                  </div>
                  <h3 className="text-base font-black leading-tight border-l-4 border-primary pl-3">
                    {q.type === 'fill-up' ? q.sentence : (q.question || q.prompt)}
                  </h3>
                  
                  {q.type === 'mcq' && q.options && (
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => setCurrentAnswers(prev => ({ ...prev, [i]: opt }))}
                          className={cn(
                            "lingua-button h-11 justify-start px-4 font-bold text-left text-sm",
                            currentAnswers[i] === opt ? "lingua-button-primary" : "bg-muted/50 border-muted text-foreground"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.type === 'fill-up' && (
                    <Input 
                      placeholder="Missing word..."
                      className="h-11 rounded-xl border-2 font-bold text-base bg-muted/20"
                      value={currentAnswers[i] || ""}
                      onChange={(e) => setCurrentAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                    />
                  )}
                  {(q.type === 'short-answer' || q.type === 'long-answer') && (
                    <Textarea 
                      placeholder={`Response in ${profile.targetLanguage}...`}
                      className="min-h-[140px] rounded-2xl border-2 p-4 font-medium text-base bg-muted/10"
                      value={currentAnswers[i] || ""}
                      onChange={(e) => setCurrentAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <Button 
                onClick={submitTest}
                disabled={isGrading}
                className="w-full lingua-button lingua-button-primary h-16 text-xl shadow-2xl"
              >
                {isGrading ? <Loader2 className="animate-spin mr-3" /> : "FINISH EXAM"}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="text-center space-y-8 py-8 animate-in zoom-in duration-700">
            <div className={cn(
              "w-40 h-40 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl border-b-[10px]",
              result.score >= 90 ? "bg-primary/5 border-primary" : "bg-zinc-100 border-muted"
            )}>
              <Trophy className={cn("w-16 h-16", result.score >= 90 ? "text-primary fill-primary/10" : "text-muted-foreground/20")} />
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter leading-none">{result.score}%</h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Evaluation</p>
              <div className="p-5 bg-white rounded-3xl border-2 border-dashed border-muted max-w-md mx-auto">
                 <p className="text-sm font-bold text-foreground italic leading-relaxed">"{result.feedback}"</p>
              </div>
            </div>

            {result.score >= 90 ? (
              <div className="bg-primary/5 rounded-[2rem] border-2 border-primary/20 p-6 space-y-4 max-w-sm mx-auto">
                <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-xl font-black">Distinction</h3>
                <p className="text-[10px] font-medium text-muted-foreground leading-tight">Admin verification pending. Official Certificate will be uploaded within 24 hours.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-500 font-black uppercase tracking-widest text-[8px]">90% required for certification.</p>
                <Button onClick={() => window.location.reload()} className="lingua-button h-12 px-8 bg-white border-muted text-xs">RETRY EXAM</Button>
              </div>
            )}

            <Button onClick={() => window.location.href = '/dashboard'} className="lingua-button lingua-button-primary h-14 px-8 text-lg shadow-xl">
              RETURN HOME
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
