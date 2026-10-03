"use client";

import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Settings, User, Target, Save, RefreshCw, Globe, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from "@/lib/utils";

const LANGUAGES = [
  "English", "Hindi", "Sanskrit", "Punjabi", "Bhojpuri", "Haryanvi", 
  "Spanish", "French", "German", "Italian", "Japanese", "Mandarin"
];

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function SettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [dailyGoal, setDailyGoal] = useState("50");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [grade, setGrade] = useState("1");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDailyGoal(profile.dailyGoal?.toString() || "50");
      setTargetLanguage(profile.targetLanguage || "English");
      setGrade(profile.grade?.toString() || "1");
    }
  }, [profile]);

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-background p-6 pt-8 space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, "users", profile.id);
      const updateData = {
        name: name.trim(),
        dailyGoal: parseInt(dailyGoal),
        targetLanguage: targetLanguage,
        grade: parseInt(grade),
        ...(targetLanguage !== profile.targetLanguage ? { 
          currentBatch: [],
          currentBatchLanguage: "",
          dailyWordCompleted: false 
        } : {})
      };

      await updateDoc(userRef, updateData)
        .catch(async () => {
          const error = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: updateData,
          });
          errorEmitter.emit('permission-error', error);
        });

      toast({
        title: "Settings Updated",
        description: "Your profile preferences have been saved.",
      });
      router.push("/profile");
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 pt-8">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-500 pt-safe">
        <header className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <Settings className="w-7 h-7 text-primary" /> Settings
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Customize your experience</p>
          </div>
        </header>

        <div className="space-y-6">
          <section className="lingua-card border-b-8 bg-white p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <User className="w-5 h-5" />
                <h2 className="text-sm font-black uppercase tracking-widest">Identity</h2>
              </div>
              <div className="space-y-1">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Display Name</Label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name" 
                  className="h-14 rounded-2xl border-2 border-muted focus-visible:ring-primary text-lg font-bold"
                />
              </div>
            </div>

            <div className="h-px bg-muted" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#22c55e]">
                  <Globe className="w-5 h-5" />
                  <h2 className="text-sm font-black uppercase tracking-widest">Language</h2>
                </div>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 border-muted font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang} className="font-bold py-3">{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-500">
                  <BookOpen className="w-5 h-5" />
                  <h2 className="text-sm font-black uppercase tracking-widest">Academic Grade</h2>
                </div>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 border-muted font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {GRADES.map(g => (
                      <SelectItem key={g} value={g.toString()} className="font-bold py-3">Grade {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-px bg-muted" />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Target className="w-5 h-5" />
                <h2 className="text-sm font-black uppercase tracking-widest">Daily XP Goal</h2>
              </div>
              <RadioGroup value={dailyGoal} onValueChange={setDailyGoal} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GoalOption value="50" label="Casual" xp="50" />
                <GoalOption value="100" label="Steady" xp="100" />
                <GoalOption value="200" label="Expert" xp="200" />
              </RadioGroup>
            </div>
          </section>

          <Button 
            onClick={handleSave} 
            disabled={saving || !name.trim()}
            className="w-full lingua-button lingua-button-primary h-20 text-2xl shadow-xl shadow-primary/20"
          >
            {saving ? <RefreshCw className="w-8 h-8 mr-3 animate-spin" /> : <Save className="w-8 h-8 mr-3" />}
            SAVE CHANGES
          </Button>
        </div>
      </main>
    </div>
  );
}

function GoalOption({ value, label, xp }: { value: string, label: string, xp: string }) {
  return (
    <Label
      htmlFor={value}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-muted bg-white cursor-pointer transition-all hover:bg-muted/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
        "has-[:checked]:border-primary has-[:checked]:bg-primary/5"
      )}
    >
      <RadioGroupItem value={value} id={value} className="sr-only" />
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      <span className="text-xl font-black">{xp} XP</span>
    </Label>
  );
}
