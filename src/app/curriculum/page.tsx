"use client";

import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Calculator, 
  Atom, 
  FlaskConical, 
  Cpu, 
  History, 
  Lightbulb,
  Trophy,
  GraduationCap
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BottomNav } from '@/components/layout/BottomNav';

const SUBJECTS = [
  { id: 'maths', name: 'Maths', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50', accent: 'border-b-blue-500' },
  { id: 'physics', name: 'Physics', icon: Atom, color: 'text-purple-600', bg: 'bg-purple-50', accent: 'border-b-purple-500' },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, color: 'text-pink-600', bg: 'bg-pink-50', accent: 'border-b-pink-500' },
  { id: 'ai', name: 'AI (Computer)', icon: Cpu, color: 'text-orange-600', bg: 'bg-orange-50', accent: 'border-b-orange-500' },
  { id: 'social-studies', name: 'Social Studies', icon: History, color: 'text-green-600', bg: 'bg-green-50', accent: 'border-b-green-500' },
  { id: 'gk', name: 'GK', icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50', accent: 'border-b-yellow-500' },
];

export default function CurriculumPage() {
  const { profile, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [pendingSubject, setPendingSubject] = useState<string | null>(null);

  const handleSubjectClick = (subjectId: string, isQuiz: boolean = false) => {
    const targetPath = isQuiz ? `/quiz?subject=${subjectId}` : `/learn?subject=${subjectId}`;
    if (!profile?.grade) {
      setPendingSubject(targetPath);
      setShowGradeDialog(true);
    } else {
      router.push(targetPath);
    }
  };

  const handleSetGrade = async (grade: number) => {
    if (!profile) return;
    setIsUpdating(true);
    try {
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, { grade });
      toast({ title: "Academic Calibrated", description: `Academic Node set to Grade ${grade}.` });
      if (pendingSubject) router.push(pendingSubject);
      setShowGradeDialog(false);
    } catch (err) {
      toast({ title: "Calibration Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background p-4 pt-16 space-y-4">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 pt-16 relative bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
        <header className="flex items-center gap-4">
           <div>
             <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900 uppercase">Academic Sector</h1>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">L0 Global Curriculum Hub</p>
           </div>
        </header>

        <section className="space-y-4">
          <div className="terminal-label bg-zinc-900 text-white shadow-lg">
            <BookOpen className="w-3 h-3 text-primary" />
            <span>Academic curriculum</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SUBJECTS.map((sub) => (
              <motion.div 
                key={sub.id} 
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => handleSubjectClick(sub.id)}
                className={cn(
                  "lingua-card !bg-white p-6 flex flex-col items-center gap-4 text-center border-b-[10px] hover:border-primary transition-all cursor-pointer shadow-xl",
                  sub.accent
                )}
              >
                <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner", sub.bg)}>
                  <sub.icon className={cn("w-8 h-8", sub.color)} />
                </div>
                <div>
                   <p className="text-sm font-black italic text-zinc-900 uppercase tracking-tighter leading-none">{sub.name}</p>
                </div>
                <div className="w-full pt-4 border-t border-zinc-50">
                   <Button variant="outline" className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-widest border-2">
                     LEARN NODE
                   </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-zinc-950 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-primary/20">
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -mr-40 -mt-40" />
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Global Scholar<br/>Sync</h3>
                <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                  Every node mastered in the academic curriculum adds directly to your XP Pool and global ranking. Precision is required for elite certification.
                </p>
                <Button onClick={() => router.push('/test')} className="h-14 px-8 rounded-2xl bg-[#22c55e] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95">
                  START CERTIFICATION
                </Button>
              </div>
              <div className="hidden md:flex justify-center">
                 <div className="w-48 h-48 bg-white/5 rounded-[4rem] border border-white/10 flex items-center justify-center rotate-6 shadow-3xl">
                   <Trophy className="w-24 h-24 text-yellow-500 animate-pulse" />
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="rounded-[2.5rem] bg-white p-8 border-none shadow-3xl max-w-sm">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
               <GraduationCap className="w-8 h-8 text-blue-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-center italic text-zinc-900">Academic Calibration</DialogTitle>
            <DialogDescription className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Please select your scholarly grade to synchronize the technical curriculum.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-6">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <Button 
                key={g} 
                variant="outline" 
                onClick={() => handleSetGrade(g)}
                className="h-12 rounded-xl font-black text-sm border-2 hover:bg-blue-50 hover:border-blue-200 text-zinc-900"
              >
                G-{g}
              </Button>
            ))}
          </div>
          <DialogFooter>
             <p className="text-[8px] font-black text-center text-muted-foreground uppercase tracking-widest w-full opacity-40">L0 Scholar Auth Required</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <BottomNav />
    </div>
  );
}

