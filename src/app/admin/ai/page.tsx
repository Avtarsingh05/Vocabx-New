"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { BrainCircuit, Sparkles, MessageCircle, Trophy, Settings2, ShieldAlert, Cpu, Terminal, Clock, Zap, BarChart3, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export default function AIControlPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [timeToReset, setTimeToReset] = useState("");
  
  const [settings, setSettings] = useState({
    difficulty: "medium",
    dailyLimit: 200, // Increased for paid tier
    aiPrompt: "You are the VocabX Master Intelligence. Your mission is to evolve user lexicons through high-intensity linguistic engagement. Maintain a tone of encouragement mixed with clinical precision.",
    chatEnabled: true,
    quizEnabled: true
  });

  const [usage, setUsage] = useState({
    remainingCycles: 9842,
    totalLimit: 10000,
    efficiency: "98.4%"
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.isAdmin) return;
      const docRef = doc(db, "ai_usage", "global");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setUsage({
          remainingCycles: data.remainingCycles || 9842,
          totalLimit: data.totalLimit || 10000,
          efficiency: `${((data.remainingCycles / data.totalLimit) * 100).toFixed(1)}%`
        });
      }
    };
    fetchStats();
  }, [profile]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const reset = new Date();
      reset.setUTCHours(24, 0, 0, 0); 
      const diff = reset.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeToReset(`${hours}h ${mins}m ${secs}s`);
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, []);

  const handleSaveSimulation = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "ai_settings", "global");
      await setDoc(docRef, settings);
      toast({ 
        title: "Simulation Sequence Complete", 
        description: "Parameters cached in high-priority terminal node." 
      });
    } catch (err) {
      toast({ title: "Deployment Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (profile?.isAdmin !== true) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-700 p-4">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4 opacity-50" />
        <h2 className="text-2xl font-black italic tracking-tighter">Access Restricted</h2>
        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em]">L0 Clearance Required</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 md:space-y-8 animate-in slide-in-from-bottom-10 duration-1000 pb-safe">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="px-2 py-1 bg-primary text-white rounded text-[8px] font-black uppercase tracking-widest border border-primary flex items-center gap-1.5">
              <Star className="w-2.5 h-2.5 fill-white" /> PAID TIER ACTIVE
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-3 italic text-zinc-900">
             <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-primary" /> Behavioral Logic
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-2 opacity-50 leading-none">Guardian Intelligence Node</p>
        </div>
        <Button onClick={handleSaveSimulation} disabled={saving} className="lingua-button lingua-button-primary h-14 md:h-16 px-8 md:px-10 shadow-2xl shadow-primary/20">
          {saving ? <Cpu className="animate-spin mr-3" /> : <Terminal className="mr-3 w-5 h-5" />}
          DEPLOY PARAMS
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <section className="md:col-span-2 bg-zinc-900 text-white rounded-[2rem] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden border-b-[8px] border-primary/20 shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px] -mr-20 -mt-20" />
            <div className="relative z-10 space-y-6">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        <Zap className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                        <h2 className="text-lg font-black italic leading-none">Neural Quota</h2>
                        <p className="text-[8px] font-black uppercase tracking-widest text-primary/60 mt-1">Priority Cycle Pool</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Reset In</p>
                     <p className="text-sm font-black font-mono text-primary">{timeToReset}</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                     <p className="text-3xl font-black italic tracking-tighter">{usage.remainingCycles.toLocaleString()} <span className="text-sm font-bold opacity-40">/ {usage.totalLimit.toLocaleString()}</span></p>
                     <p className="text-xs font-black text-primary uppercase">{usage.efficiency} Efficiency</p>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                     <div 
                        className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(86,201,29,0.5)]" 
                        style={{ width: usage.efficiency }} 
                     />
                  </div>
               </div>
            </div>
         </section>

         <section className="bg-white rounded-[2rem] p-6 md:p-8 border-b-8 border-muted shadow-sm flex flex-col justify-center text-center space-y-2">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
               <Clock className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Next Cycle Reset</p>
            <p className="text-xl font-black italic text-zinc-900">00:00 UTC</p>
            <p className="text-[8px] font-bold text-muted-foreground leading-tight px-4 italic">Paid tier offers 10x capacity.</p>
         </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-muted/50 space-y-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 pb-4 border-b border-muted">
             <Settings2 className="w-6 h-6 text-primary" />
             <h2 className="text-xl font-black italic">Core Processor</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Difficulty Matrix</Label>
              <Select value={settings.difficulty} onValueChange={(v) => setSettings({...settings, difficulty: v})}>
                <SelectTrigger className="h-14 rounded-2xl border-2 border-muted font-black text-lg focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2">
                  <SelectItem value="easy" className="font-bold py-3 uppercase text-xs tracking-widest">L1: NOVICE</SelectItem>
                  <SelectItem value="medium" className="font-bold py-3 uppercase text-xs tracking-widest">L2: STANDARD</SelectItem>
                  <SelectItem value="hard" className="font-bold py-3 uppercase text-xs tracking-widest">L3: OVERLORD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Neural Cycle Limit</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={settings.dailyLimit} 
                  onChange={(e) => setSettings({...settings, dailyLimit: parseInt(e.target.value) || 0})}
                  className="h-14 rounded-2xl border-2 border-muted font-black text-xl focus-visible:ring-primary pl-6 shadow-inner"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-muted-foreground/40 uppercase">WORDS/DAY</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-muted/50 space-y-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 pb-4 border-b border-muted">
             <Sparkles className="w-6 h-6 text-secondary" />
             <h2 className="text-xl font-black italic">Neural Modules</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-3xl border border-muted/50 transition-all hover:bg-muted/30">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border-2 border-muted shadow-sm">
                    <MessageCircle className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                    <p className="font-black text-sm italic">AI Tutor</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Dialogue</p>
                 </div>
              </div>
              <Switch checked={settings.chatEnabled} onCheckedChange={(v) => setSettings({...settings, chatEnabled: v})} />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-3xl border border-muted/50 transition-all hover:bg-muted/30">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border-2 border-muted shadow-sm">
                    <Trophy className="w-5 h-5 text-secondary" />
                 </div>
                 <div>
                    <p className="font-black text-sm italic">Quiz Engine</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Assessment</p>
                 </div>
              </div>
              <Switch checked={settings.quizEnabled} onCheckedChange={(v) => setSettings({...settings, quizEnabled: v})} />
            </div>
          </div>
        </section>

        <section className="md:col-span-2 bg-zinc-900 text-white rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-6 border-b-[8px] border-primary/20 relative overflow-hidden">
           <div className="relative z-10">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
                 <Terminal className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h2 className="text-2xl font-black italic tracking-tighter leading-tight">System Matrix</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Neural Directives</p>
               </div>
             </div>
             
             <div className="space-y-4">
                <Textarea 
                  value={settings.aiPrompt} 
                  onChange={(e) => setSettings({...settings, aiPrompt: e.target.value})}
                  className="min-h-[180px] md:min-h-[220px] bg-white/5 border-white/10 rounded-[1.5rem] p-6 text-sm md:text-lg font-medium leading-relaxed focus:border-primary transition-all shadow-inner"
                  placeholder="Input cognitive constraints..."
                />
             </div>
           </div>
        </section>
      </div>
    </div>
  );
}
