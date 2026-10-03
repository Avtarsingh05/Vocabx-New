"use client";

import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, History, BookOpen, Star, Flame, ChevronRight, ShieldCheck, User, Users, ShieldAlert, Languages, Gamepad2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { BottomNav } from '@/components/layout/BottomNav';

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-10 pt-16">
        <Navbar />
        <main className="max-w-2xl mx-auto p-4 space-y-6">
          <Skeleton className="h-64 w-full rounded-[3rem]" />
        </main>
      </div>
    );
  }

  if (!profile) return null;

  const wordsLearnedCount = profile.learnedWords?.length || 0;
  const displayName = profile.name || "Scholar Node";
  const userInitials = (displayName || "S").substring(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-8 pt-16">
      <Navbar />
      
      {/* MOBILE VIEW */}
      <main className="lg:hidden max-w-2xl mx-auto p-4 md:p-6 space-y-6 relative z-10">
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lingua-card flex flex-col items-center text-center space-y-5 p-6 bg-white shadow-sm border-b-[4px] border-zinc-100"
        >
          <Avatar className="w-24 h-24 border-[4px] border-white shadow-md rounded-2xl">
            <AvatarImage src={`https://picsum.photos/seed/${profile.id}/400`} />
            <AvatarFallback className="text-2xl font-bold bg-green-50 text-[#22c55e]">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 w-full">
            <h1 className="text-2xl font-bold text-zinc-900 leading-tight">{displayName}</h1>
            <p className="text-muted-foreground font-medium text-xs">{profile.email}</p>
            <div className="inline-flex items-center gap-1.5 bg-[#22c55e]/10 text-[#22c55e] px-4 py-1.5 rounded-full mt-4 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>{profile.level} Scholar</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full pt-4 border-t border-zinc-50">
            <StatSmall icon={<Flame className="w-5 h-5 text-orange-500" />} value={profile.streak} label="Streak" color="orange" delay={0.2} />
            <StatSmall icon={<Star className="w-5 h-5 text-[#22c55e]" />} value={profile.xp} label="Total XP" color="green" delay={0.3} />
            <StatSmall icon={<BookOpen className="w-5 h-5 text-blue-500" />} value={wordsLearnedCount} label="Words" color="blue" delay={0.4} />
          </div>
        </motion.section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-2 px-2">
            <User className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-600">Settings & Protocols</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {profile.isAdmin && <Link href="/admin"><ProfileActionButton icon={<ShieldAlert className="w-5 h-5 text-red-500" />} label="Guardian Console" detail="L0 Security" variant="admin" delay={0.1}/></Link>}
            <Link href="/test"><ProfileActionButton icon={<ShieldCheck className="w-5 h-5 text-[#22c55e]" />} label="Mastery Exam" detail="Terminal Certification" delay={0.2}/></Link>
            <Link href="/leaderboard"><ProfileActionButton icon={<Users className="w-5 h-5 text-blue-500" />} label="Global Rankings" detail="Competitive Matrix" delay={0.3}/></Link>
            <Link href="/profile/history"><ProfileActionButton icon={<History className="w-5 h-5 text-purple-500" />} label="Learning History" detail={`${wordsLearnedCount} words learned`} delay={0.4}/></Link>
            <Link href="/alphabets"><ProfileActionButton icon={<Languages className="w-5 h-5 text-indigo-500" />} label="Alphabet Lab" detail="Script Explorer" delay={0.45}/></Link>
            <Link href="/games"><ProfileActionButton icon={<Gamepad2 className="w-5 h-5 text-pink-500" />} label="Arena Games" detail="Combat Bouts" delay={0.48}/></Link>
            <Link href="/profile/settings"><ProfileActionButton icon={<Settings className="w-5 h-5 text-zinc-500" />} label="Preferences" detail="Account settings" delay={0.5}/></Link>
          </div>
        </section>

        <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-xl text-red-600 border-red-100 bg-red-50/50 font-bold hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm mt-4">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </main>

      {/* WEB VIEW */}
      <main className="hidden lg:grid grid-cols-[400px_1fr] gap-8 max-w-[1600px] mx-auto p-8 mt-16 min-h-[calc(100vh-64px)]">
         <aside className="space-y-6 scrollbar-hide pb-8">
            <section className="lingua-card !bg-white/90 p-10 border-b-8 border-green-500/20 flex flex-col items-center text-center space-y-8 shadow-2xl relative">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#22c55e] to-[#3b82f6]" />
               <Avatar className="w-48 h-48 border-[12px] border-white shadow-2xl rounded-[4rem]">
                  <AvatarImage src={`https://picsum.photos/seed/${profile.id}/600`} />
                  <AvatarFallback className="text-7xl font-black bg-green-50 text-[#22c55e]">{userInitials}</AvatarFallback>
               </Avatar>
               <div>
                  <h2 className="text-4xl font-black italic tracking-tighter text-zinc-900 leading-tight">{displayName}</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.4em] mt-2">{profile.email}</p>
               </div>
               <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-zinc-50 p-6 rounded-[2.5rem] border border-zinc-100">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Level</p>
                     <p className="text-xl font-black text-[#22c55e] italic">{profile.level}</p>
                  </div>
                  <div className="bg-zinc-50 p-6 rounded-[2.5rem] border border-zinc-100">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Grade</p>
                     <p className="text-xl font-black text-blue-500 italic">G-{profile.grade}</p>
                  </div>
               </div>
               <Button onClick={handleLogout} variant="destructive" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                  LOGOUT OF NETWORK
               </Button>
            </section>
         </aside>

         <section className="space-y-8 scrollbar-hide pb-20">
            <header>
               <h1 className="text-5xl font-black tracking-tighter italic text-zinc-900">Identity Terminal</h1>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.5em] mt-2">Personal Telemetry & Credentials</p>
            </header>

            <div className="grid grid-cols-3 gap-6">
               <WebStat icon={<Flame className="w-8 h-8 text-orange-500" />} label="Current Streak" value={profile.streak} unit="Days" />
               <WebStat icon={<Star className="w-8 h-8 text-[#22c55e]" />} label="Total XP Units" value={profile.xp} unit="Units" />
               <WebStat icon={<BookOpen className="w-8 h-8 text-blue-500" />} label="Lexical Nodes" value={wordsLearnedCount} unit="Nodes" />
            </div>

            <div className="grid grid-cols-2 gap-8">
               <section className="space-y-4">
                  <div className="terminal-label">
                     <ShieldCheck className="w-3 h-3 text-[#22c55e]" />
                     <span>Certification Node</span>
                  </div>
                  <Link href="/test" className="group">
                     <div className="lingua-card bg-white p-10 border-b-[12px] border-[#22c55e]/20 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                        <ShieldCheck className="w-16 h-16 mb-6 text-[#22c55e] animate-pulse" />
                        <h3 className="text-3xl font-black italic tracking-tighter leading-tight uppercase text-zinc-900">Mastery Exam</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 text-muted-foreground">Global Certification Required</p>
                        <div className="mt-8 flex justify-end">
                           <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100">
                              <ChevronRight className="w-8 h-8 text-[#22c55e]" />
                           </div>
                        </div>
                     </div>
                  </Link>
               </section>

               <section className="space-y-4">
                  <div className="terminal-label">
                     <History className="w-3 h-3 text-purple-500" />
                     <span>Data Vaults</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     <Link href="/profile/history" className="block">
                        <div className="lingua-card bg-white p-8 border-b-8 shadow-xl flex items-center justify-between hover:scale-[1.02] transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                                 <History className="w-7 h-7 text-purple-600" />
                              </div>
                              <div>
                                 <p className="font-black text-xl italic text-zinc-900">Training History</p>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Access all nodes</p>
                              </div>
                           </div>
                           <ChevronRight className="w-6 h-6 opacity-20" />
                        </div>
                     </Link>
                     <Link href="/profile/settings" className="block">
                        <div className="lingua-card bg-white p-8 border-b-8 shadow-xl flex items-center justify-between hover:scale-[1.02] transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center">
                                 <Settings className="w-7 h-7 text-zinc-600" />
                              </div>
                              <div>
                                 <p className="font-black text-xl italic text-zinc-900">System Parameters</p>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Calibrate experience</p>
                              </div>
                           </div>
                           <ChevronRight className="w-6 h-6 opacity-20" />
                        </div>
                     </Link>
                     <Link href="/games" className="block">
                        <div className="lingua-card bg-white p-8 border-b-8 shadow-xl flex items-center justify-between hover:scale-[1.02] transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                 <Gamepad2 className="w-7 h-7 text-indigo-600" />
                              </div>
                              <div>
                                 <p className="font-black text-xl italic text-zinc-900">Combat Arena</p>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tactical Bout Entry</p>
                              </div>
                           </div>
                           <ChevronRight className="w-6 h-6 opacity-20" />
                        </div>
                     </Link>
                  </div>
               </section>
            </div>
         </section>
      </main>
      <BottomNav />
    </div>
  );
}

function StatSmall({ icon, value, label, color, delay }: { icon: React.ReactNode, value: number | string, label: string, color: 'orange' | 'blue' | 'green', delay: number }) {
  const themes = {
    orange: "bg-orange-50 border-orange-100 text-orange-600",
    green: "bg-green-50 border-green-100 text-[#22c55e]",
    blue: "bg-blue-50 border-blue-100 text-blue-500",
  };
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay }} className={cn("flex flex-col items-center p-3 rounded-2xl border transition-all shadow-sm", themes[color])}>
      <div className="mb-1">{icon}</div>
      <p className="text-sm font-bold leading-none tracking-tight truncate w-full text-center text-zinc-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider mt-1 truncate w-full text-center opacity-80">{label}</p>
    </motion.div>
  );
}

function ProfileActionButton({ icon, label, detail, variant = 'default', delay }: { icon: React.ReactNode, label: string, detail: string, variant?: 'default' | 'admin', delay: number }) {
  return (
    <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay }} className={cn("w-full lingua-card h-16 flex items-center justify-between px-4 bg-white shadow-sm border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-colors", variant === 'admin' && "border-red-100 bg-red-50/30")}>
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", variant === 'admin' ? "bg-red-50" : "bg-zinc-50")}>{icon}</div>
        <div className="text-left">
          <p className="font-bold text-sm text-zinc-900 leading-none mb-1">{label}</p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">{detail}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-30" />
    </motion.div>
  );
}

function WebStat({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string | number, unit: string }) {
  return (
    <div className="lingua-card bg-white p-10 border-b-8 border-green-500/20 space-y-6 shadow-2xl flex flex-col items-center text-center">
       <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center shadow-inner">{icon}</div>
       <div>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
          <p className="text-5xl font-black italic text-zinc-900 tracking-tighter">{value}</p>
          <p className="text-[10px] font-black text-[#22c55e] uppercase tracking-[0.3em] mt-3">{unit}</p>
       </div>
    </div>
  );
}

