"use client";

import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { 
  ChevronRight, 
  Sparkles, 
  Globe,
  RefreshCw,
  Zap,
  GraduationCap,
  User,
  Activity,
  Flame,
  LayoutDashboard,
  ShieldCheck,
  Code2,
  BookOpen,
  Star,
  Target,
  Languages,
  Gamepad2,
  Smartphone,
  Download
} from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { BottomNav } from '@/components/layout/BottomNav';

const LANGUAGES = [
  "English", "Hindi", "Sanskrit", "Punjabi", "Bhojpuri", "Haryanvi", 
  "Spanish", "French", "German", "Italian", "Japanese", "Mandarin"
];

const SUBJECTS = [
  { id: 'maths', name: 'Maths', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'physics', name: 'Physics', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'chemistry', name: 'Chemistry', icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'ai', name: 'AI Core', icon: Code2, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'social-studies', name: 'Society', icon: Globe, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'gk', name: 'Intel', icon: Sparkles, color: 'text-yellow-600', bg: 'bg-yellow-50' },
];

export default function Dashboard() {
  const { profile, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState<any>(null);



  useEffect(() => {
    const fetchUsage = async () => {
      if (!profile) return;
      try {
        const usageSnap = await getDoc(doc(db, "ai_usage", "global"));
        const usageData = usageSnap.exists() ? usageSnap.data() : { remainingCycles: 942, totalLimit: 1000 };
        setStats({
          remainingCycles: usageData.remainingCycles,
          totalLimit: usageData.totalLimit,
          totalScholars: 2540 // Using a stabilized count to avoid permission listing errors
        });
      } catch (err) {
        console.error("Telemetry Sync Error:", err);
      }
    };
    fetchUsage();
  }, [profile]);

  const metrics = useMemo(() => {
    if (!profile) return null;
    
    const dailyGoal = profile.dailyGoal || 50;
    const dailyProgress = Math.min((profile.xp / dailyGoal) * 100, 100);

    const nextMilestone = Math.ceil((profile.xp + 1) / 1000) * 1000;
    const xpInCurrentMilestone = profile.xp % 1000;
    const milestoneProgress = (xpInCurrentMilestone / 1000) * 100;

    return { dailyProgress, dailyGoal, nextMilestone, milestoneProgress };
  }, [profile]);

  const handleLanguageChange = async (newLang: string) => {
    if (!profile || newLang === profile.targetLanguage) return;
    setIsUpdating(true);
    try {
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, { targetLanguage: newLang, currentBatch: [], currentBatchLanguage: "" });
      toast({ title: "Linguistic Switch", description: `Synchronizing feed for ${newLang}.` });
    } catch (err: any) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !profile || !metrics) {
    return (
      <div className="min-h-screen bg-background p-4 pt-10 space-y-4">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  const firstName = (profile.name || "Scholar").split(' ')[0];

  return (
    <div className="min-h-screen relative bg-background">
      <Navbar />
      
      {/* MOBILE VIEW */}
      <main className="block lg:hidden max-w-4xl mx-auto p-4 space-y-4 pt-16 pb-8">
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lingua-card !bg-white border-b-[6px] border-muted p-5 space-y-5 relative overflow-hidden shadow-sm"
        >
          <div className="flex justify-between items-start">
             <div className="space-y-0.5">
               <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                 Hello, <span className="text-[#22c55e]">{firstName}!</span>
               </h1>
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                 <p className="text-xs text-zinc-500 font-medium">{profile.level} Scholar</p>
               </div>
             </div>
             <Select value={profile.targetLanguage} onValueChange={handleLanguageChange} disabled={isUpdating}>
               <SelectTrigger className="w-[105px] h-9 rounded-xl font-semibold text-xs bg-zinc-50 border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 text-[#22c55e]" />}
                    <SelectValue />
                  </div>
               </SelectTrigger>
               <SelectContent position="popper" side="bottom" sideOffset={4} avoidCollisions={false} className="rounded-2xl border-zinc-100 shadow-xl bg-white/95 backdrop-blur-xl overflow-hidden max-h-[300px] w-[var(--radix-select-trigger-width)]">
                 {LANGUAGES.map(lang => (
                   <SelectItem key={lang} value={lang} className="font-semibold py-2.5 text-sm">{lang}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>

          <div className="grid grid-cols-3 gap-2">
             <HeroStat icon={<Star className="w-4 h-4 text-[#22c55e] fill-[#22c55e]" />} value={profile.xp} label="XP" color="green" />
             <HeroStat icon={<Flame className="w-4 h-4 text-orange-500 fill-orange-500" />} value={`${profile.streak}d`} label="Streak" color="orange" />
             <HeroStat icon={<ShieldCheck className="w-4 h-4 text-blue-500" />} value={profile.level.substring(0,2)} label="Rank" color="blue" />
          </div>
        </motion.section>

        {/* Tactical Metrics Progress */}
        <section className="space-y-4">
           <div className="lingua-card !bg-white p-5 space-y-4 border-b-[6px] border-zinc-100 shadow-md">
              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-500">Daily Goal</span>
                    <span className="text-xs font-bold text-[#22c55e]">{profile.xp} / {metrics.dailyGoal} XP</span>
                 </div>
                 <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.dailyProgress}%` }}
                      className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-500">Next Milestone</span>
                    <span className="text-xs font-bold text-blue-500">{metrics.nextMilestone} XP</span>
                 </div>
                 <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.milestoneProgress}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    />
                 </div>
              </div>
           </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link href="/quiz?mode=challenge">
             <div className="lingua-card bg-gradient-to-br from-[#22c55e] to-emerald-700 p-5 h-full border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all">
                <Zap className="w-6 h-6 text-white fill-white mb-3" />
                <h3 className="text-base font-black text-white leading-tight">Quick Quiz</h3>
                <p className="text-[10px] font-semibold text-white/60 mt-1">Speed challenge</p>
             </div>
          </Link>
          <Link href="/college-prep">
             <div className="lingua-card bg-gradient-to-br from-indigo-600 to-blue-800 p-5 h-full border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all">
                <GraduationCap className="w-6 h-6 text-white mb-3" />
                <h3 className="text-base font-black text-white leading-tight">College Prep</h3>
                <p className="text-[10px] font-semibold text-white/60 mt-1">Career logic</p>
             </div>
          </Link>
          <Link href="/learn">
             <div className="lingua-card bg-gradient-to-br from-blue-500 to-cyan-600 p-5 h-full border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all">
                <BookOpen className="w-6 h-6 text-white mb-3" />
                <h3 className="text-base font-black text-white leading-tight">Learn</h3>
                <p className="text-[10px] font-semibold text-white/60 mt-1">Syllabus</p>
             </div>
          </Link>
          <Link href="/games">
             <div className="lingua-card bg-gradient-to-br from-purple-500 to-fuchsia-600 p-5 h-full border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all">
                <Gamepad2 className="w-6 h-6 text-white mb-3" />
                <h3 className="text-base font-black text-white leading-tight">Arena</h3>
                <p className="text-[10px] font-semibold text-white/60 mt-1">Play & win</p>
             </div>
          </Link>
        </section>

        <section className="space-y-2.5 pt-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Quick Access</p>

          <Link href="/curriculum" className="block">
            <div className="lingua-card !bg-white flex items-center justify-between p-4 border-b-[6px] border-[#22c55e]/10 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
                  <Sparkles className="w-5 h-5 text-[#22c55e] fill-[#22c55e]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Academic Curriculum</h2>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Learn core subjects</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
            </div>
          </Link>

          <Link href="/alphabets" className="block">
            <div className="lingua-card !bg-white flex items-center justify-between p-4 border-b-[6px] border-blue-500/10 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                  <Languages className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Alphabet Lab</h2>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Explore languages</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
            </div>
          </Link>
        </section>
      </main>

      {/* WEB VIEW TERMINAL */}
      <main className="hidden lg:grid grid-cols-[300px_1fr_320px] gap-6 max-w-[1500px] mx-auto p-6 mt-16 min-h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <aside className="space-y-6 pb-8">
           <section className="lingua-card !bg-white p-6 border-b-[6px] border-green-500/20 space-y-5 shadow-sm flex flex-col items-center text-center">
              <div className="relative">
                 <Avatar className="w-20 h-20 border-[4px] border-white shadow-md rounded-2xl">
                    <AvatarImage src={`https://picsum.photos/seed/${profile.id}/200`} />
                    <AvatarFallback className="text-2xl font-bold">{(profile.name || 'S')[0]}</AvatarFallback>
                 </Avatar>
                 <div className="absolute -bottom-1 -right-1 bg-[#22c55e] text-white p-1 rounded-md shadow-sm border-2 border-white">
                    <ShieldCheck className="w-3.5 h-3.5" />
                 </div>
              </div>
              <div className="w-full">
                 <h2 className="text-xl font-bold text-zinc-900 leading-none">
                    Hello, <span className="text-[#22c55e]">{firstName}</span>!
                 </h2>
                 <p className="text-xs font-medium text-zinc-500 mt-1.5 mb-4">{profile.level} Scholar</p>
                 
                 <div className="space-y-2 mt-4">
                   <Select value={profile.targetLanguage || "English"} onValueChange={handleLanguageChange} disabled={isUpdating}>
                      <SelectTrigger className="w-full h-10 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-between px-3 border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                          <div className="flex items-center gap-2 text-zinc-700">
                              {isUpdating ? <RefreshCw className="w-4 h-4 text-[#22c55e] animate-spin" /> : <Globe className="w-4 h-4 text-[#22c55e]" />}
                              <SelectValue />
                          </div>
                      </SelectTrigger>
                      <SelectContent position="popper" side="bottom" sideOffset={4} avoidCollisions={false} className="rounded-2xl shadow-2xl border-zinc-100 bg-white overflow-hidden max-h-[300px] w-[var(--radix-select-trigger-width)]">
                          {LANGUAGES.map(lang => (
                              <SelectItem key={lang} value={lang} className="text-xs font-bold py-2.5 px-3 cursor-pointer rounded-lg hover:bg-zinc-100">{lang}</SelectItem>
                          ))}
                      </SelectContent>
                   </Select>
                   <Button variant="outline" className="w-full h-10 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center gap-2 border-zinc-200">
                      <GraduationCap className="w-4 h-4 text-zinc-500" /> Grade {profile.grade || 1}
                   </Button>
                 </div>
              </div>
           </section>

           <section className="space-y-2">
              <p className="text-xs font-bold text-zinc-400 px-2 mb-2">Navigation</p>
              {[
                { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', active: true },
                { label: 'Curriculum', icon: BookOpen, href: '/curriculum' },
                { label: 'College Prep', icon: GraduationCap, href: '/college-prep' },
                { label: 'Arena Games', icon: Gamepad2, href: '/games' },
                { label: 'Mastery Exam', icon: ShieldCheck, href: '/test' },
                { label: 'Alphabet Lab', icon: Languages, href: '/alphabets' },
                { label: 'Profile Settings', icon: User, href: '/profile' }
              ].map((link, i) => (
                <Link key={i} href={link.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group",
                    link.active ? "bg-[#22c55e]/10 text-[#22c55e] font-semibold" : "hover:bg-zinc-100/50 text-zinc-600 font-medium"
                  )}>
                    <link.icon className={cn("w-5 h-5", link.active ? "text-[#22c55e]" : "text-zinc-400")} />
                    <span className="text-sm">{link.label}</span>
                    {link.active && <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] ml-auto" />}
                  </div>
                </Link>
              ))}
           </section>
        </aside>

        {/* Center Main Content */}
        <section className="space-y-6 pb-20">
           <header className="pt-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
              <p className="text-sm font-medium text-zinc-500 mt-1">Track your progress and access your learning nodes.</p>
           </header>

           <section className="grid grid-cols-2 gap-4">
              <div className="lingua-card !bg-white p-5 space-y-4 border-b-[4px] border-zinc-100 shadow-sm">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-600 flex items-center gap-2">
                       <Target className="w-4 h-4 text-[#22c55e]" /> Daily Goal
                    </span>
                    <span className="text-sm font-bold text-[#22c55e]">{profile.xp} / {metrics.dailyGoal} XP</span>
                 </div>
                 <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.dailyProgress}%` }}
                      className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full"
                    />
                 </div>
              </div>
              <div className="lingua-card !bg-white p-5 space-y-4 border-b-[4px] border-zinc-100 shadow-sm">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-600 flex items-center gap-2">
                       <Star className="w-4 h-4 text-blue-500" /> Next Milestone
                    </span>
                    <span className="text-sm font-bold text-blue-500">{metrics.nextMilestone} XP</span>
                 </div>
                 <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.milestoneProgress}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    />
                 </div>
              </div>
           </section>

           <section className="grid grid-cols-2 gap-4">
              <Link href="/quiz?mode=challenge" className="block">
                <div className="lingua-card bg-gradient-to-br from-[#22c55e] to-emerald-700 text-white p-6 border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all h-full">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                         <Zap className="w-5 h-5 text-white fill-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">Quick Quiz</h3>
                   </div>
                   <p className="text-xs font-medium text-white/80">Test your reflexes and earn extra XP quickly.</p>
                </div>
              </Link>
              <Link href="/college-prep" className="block">
                <div className="lingua-card bg-gradient-to-br from-indigo-600 to-blue-800 text-white p-6 border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all h-full">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                         <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">College Prep</h3>
                   </div>
                   <p className="text-xs font-medium text-white/80">Study materials tailored for college readiness.</p>
                </div>
              </Link>
              <Link href="/learn" className="block">
                <div className="lingua-card bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all h-full">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                         <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">Learn</h3>
                   </div>
                   <p className="text-xs font-medium text-white/80">Follow the syllabus and master your vocabulary.</p>
                </div>
              </Link>
              <Link href="/games" className="block">
                <div className="lingua-card bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white p-6 border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all h-full">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                         <Gamepad2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">Arena</h3>
                   </div>
                   <p className="text-xs font-medium text-white/80">Compete in games and climb the leaderboard.</p>
                </div>
              </Link>
           </section>

           <section className="space-y-4 pt-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                 <BookOpen className="w-4 h-4 text-zinc-400" />
                 <h2 className="text-sm font-bold text-zinc-600">Subjects</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {SUBJECTS.map((sub) => (
                  <Link key={sub.id} href={`/curriculum?subject=${sub.id}`}>
                    <div className={cn(
                      "lingua-card !bg-white p-5 border-b-[4px] flex flex-col items-center gap-3 text-center transition-all hover:-translate-y-1 hover:shadow-md shadow-sm border-zinc-100"
                    )}>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", sub.bg)}>
                        <sub.icon className={cn("w-6 h-6", sub.color)} />
                      </div>
                      <p className="text-sm font-semibold text-zinc-800">{sub.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
           </section>
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-6 pb-8">
           <section className="lingua-card !bg-white p-6 border-b-[4px] border-zinc-100 space-y-5 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-50">
                 <Activity className="w-4 h-4 text-zinc-400" />
                 <h3 className="text-sm font-bold text-zinc-600">Activity Stats</h3>
              </div>
              <div className="space-y-3">
                 <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                       <p className="text-sm font-semibold text-zinc-700">Streak</p>
                    </div>
                    <p className="text-lg font-bold text-zinc-900">{profile.streak} <span className="text-xs text-zinc-500 font-medium">days</span></p>
                 </div>
                 <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Star className="w-5 h-5 text-[#22c55e] fill-[#22c55e]" />
                       <p className="text-sm font-semibold text-zinc-700">Total XP</p>
                    </div>
                    <p className="text-lg font-bold text-zinc-900">{profile.xp.toLocaleString()}</p>
                 </div>
              </div>
           </section>

           <section className="space-y-3">
              <div className="flex items-center gap-2 mb-2 px-2">
                 <ShieldCheck className="w-4 h-4 text-zinc-400" />
                 <h3 className="text-sm font-bold text-zinc-600">Daily Tasks</h3>
              </div>
              <div className="space-y-2">
                 <TaskCard label="Learn 5 new words" progress="0/5" icon={<BookOpen className="w-4 h-4" />} />
                 <TaskCard label="Complete 2 quizzes" progress="0/2" icon={<Target className="w-4 h-4" />} />
                 <TaskCard label="Mastery Exam" progress="LOCKED" icon={<ShieldCheck className="w-4 h-4" />} />
              </div>
           </section>

           <section className="mt-8 bg-zinc-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10">
                   <Smartphone className="w-32 h-32" />
               </div>
               <div className="relative z-10 space-y-4">
                  <div>
                      <h3 className="text-xl font-black italic tracking-tighter leading-none mb-1 text-[#22c55e]">Get the App!</h3>
                      <p className="text-xs font-medium text-zinc-400 leading-snug">Experience VocabX on the go. Available for Android devices.</p>
                  </div>
                  <a href="https://play.google.com/store/apps/details?id=com.appcollection.vocabx&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" className="block w-full">
                      <Button className="w-full rounded-xl font-bold text-xs h-10 bg-[#22c55e] text-zinc-950 hover:bg-[#22c55e]/90 shadow-sm transition-all active:scale-95">
                          <Download className="w-4 h-4 mr-2" /> Download App
                      </Button>
                  </a>
               </div>
           </section>
        </aside>

      </main>
      <BottomNav />
    </div>
  );
}

function HeroStat({ icon, value, label, color }: { icon: React.ReactNode, value: string | number, label: string, color: 'green' | 'orange' | 'blue' }) {
  const themes = {
    green: "bg-green-50/50 border-green-100",
    orange: "bg-orange-50/50 border-orange-100",
    blue: "bg-blue-50/50 border-blue-100"
  };

  return (
    <div className={cn("flex flex-col items-center gap-2 p-4 rounded-3xl border shadow-inner transition-all hover:scale-103", themes[color])}>
      <div className="mb-0.5">{icon}</div>
      <p className="text-base font-black text-zinc-900 italic leading-none tracking-tighter">{value}</p>
      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1">{label}</p>
    </div>
  );
}

function TaskCard({ label, progress, icon }: { label: string, progress: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-all shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-green-50 text-[#22c55e] flex items-center justify-center">
          {icon}
        </div>
        <p className="text-xs font-semibold text-zinc-700">{label}</p>
      </div>
      <span className="text-[10px] font-bold text-zinc-400">{progress}</span>
    </div>
  );
}























