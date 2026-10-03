
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { doc, getDoc, setDoc, addDoc, serverTimestamp, collection } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { Settings, Save, RefreshCw, Zap, ShieldCheck, Volume2, Flame, Trophy, AlertTriangle, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SystemSettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    xpPerQuiz: 50,
    xpPerCorrect: 10,
    streakEnabled: true,
    voiceEnabled: true,
    dailyChallengeEnabled: true
  });

  useEffect(() => {
    if (authLoading || !profile || !profile.isAdmin) return;

    const fetchSettings = async () => {
      try {
        const docRef = doc(firestore, "app_settings", "global");
        const snap = await getDoc(docRef);
        if (snap.exists()) setSettings(snap.data() as any);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [profile, authLoading, firestore]);

  const handleSave = async () => {
    if (!profile?.isAdmin) return;
    setSaving(true);
    try {
      const settingsRef = doc(firestore, "app_settings", "global");
      await setDoc(settingsRef, settings);
      toast({ title: "System Overhaul Complete", description: "Global nodes updated." });
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <RefreshCw className="animate-spin text-primary w-12 h-12 mb-4" />
      <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Synchronizing Global Settings...</p>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-safe">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
             <Settings className="w-8 h-8 text-primary" /> System Parameters
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Configure global reward logic</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto lingua-button lingua-button-primary h-14 px-8 shadow-xl">
          {saving ? <RefreshCw className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
          SAVE PROTOCOLS
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-muted/50 space-y-6 md:space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-muted">
             <Zap className="w-6 h-6 text-primary" />
             <h2 className="text-xl font-black italic">XP Protocol</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">XP per Quiz</Label>
              <Input type="number" value={settings.xpPerQuiz} onChange={(e) => setSettings({...settings, xpPerQuiz: parseInt(e.target.value)})} className="h-14 rounded-2xl border-2 border-muted font-black text-2xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">XP per Correct</Label>
              <Input type="number" value={settings.xpPerCorrect} onChange={(e) => setSettings({...settings, xpPerCorrect: parseInt(e.target.value)})} className="h-14 rounded-2xl border-2 border-muted font-black text-2xl" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-muted/50 space-y-6 md:space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-muted">
             <Boxes className="w-6 h-6 text-primary" />
             <h2 className="text-xl font-black italic">Feature Nodes</h2>
          </div>

          <div className="space-y-4">
            <FeatureToggle icon={<Flame className="w-5 h-5 text-orange-500" />} label="Streak System" description="Daily engagement logic" checked={settings.streakEnabled} onChange={(v) => setSettings({...settings, streakEnabled: v})} />
            <FeatureToggle icon={<Volume2 className="w-5 h-5 text-blue-500" />} label="Voice Engine" description="Speech recognition node" checked={settings.voiceEnabled} onChange={(v) => setSettings({...settings, voiceEnabled: v})} />
            <FeatureToggle icon={<Trophy className="w-5 h-5 text-secondary" />} label="Daily Challenges" description="Timed high-reward events" checked={settings.dailyChallengeEnabled} onChange={(v) => setSettings({...settings, dailyChallengeEnabled: v})} />
          </div>
        </section>

        <section className="md:col-span-2 bg-zinc-900 text-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden border-b-8 border-red-500/20">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
             </div>
             <div>
               <h2 className="text-2xl font-black italic">Critical Overrides</h2>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">High-risk controls</p>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-14 md:h-16 rounded-2xl border-white/10 hover:bg-white/5 bg-transparent font-black text-[10px] uppercase tracking-widest text-white">
                FLUSH GLOBAL CACHE
              </Button>
              <Button variant="outline" className="h-14 md:h-16 rounded-2xl border-white/10 hover:bg-red-500/10 bg-transparent font-black text-[10px] uppercase tracking-widest text-red-500">
                INITIATE LOCKDOWN
              </Button>
           </div>
        </section>
      </div>
    </div>
  );
}

function FeatureToggle({ icon, label, description, checked, onChange }: { icon: React.ReactNode, label: string, description: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-muted/50 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-muted shadow-sm">
          {icon}
        </div>
        <div>
          <p className="font-black text-sm italic leading-none mb-1">{label}</p>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
