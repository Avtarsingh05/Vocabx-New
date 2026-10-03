
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMemoFirebase } from "@/firebase/provider";
import { Trophy, Medal, Star, Flame, Loader2, ChevronRight, Activity, Target, ShieldCheck, Crown, User, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from '@/components/layout/BottomNav';

export default function LeaderboardPage() {
  const { profile, loading: authLoading } = useAuth();

  const leaderboardQuery = useMemoFirebase(() => {
    // Only initiate the query if the user profile is settled to prevent race condition permission errors
    if (!profile) return null;
    return query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
  }, [profile]);

  const { data: users, isLoading } = useCollection(leaderboardQuery);

  return (
    <div className="min-h-screen bg-background pb-28 pt-20">
      <Navbar />
      
      {/* MOBILE VIEW */}
      <main className="lg:hidden max-w-2xl mx-auto p-4 space-y-6 animate-in fade-in duration-500">
        <header className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 bg-secondary/10 rounded-[1.5rem] flex items-center justify-center mx-auto rotate-6 shadow-xl border-b-4 border-secondary/20">
            <Trophy className="w-8 h-8 text-secondary fill-secondary" />
          </div>
          <div className="terminal-label mx-auto">
             <span>Competitive Matrix: Live</span>
          </div>
        </header>

        {isLoading || authLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
        ) : (
          <div className="space-y-3">
            {users?.map((user, i) => (
              <motion.div 
                key={user.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "lingua-card bg-white p-4 flex items-center justify-between group transition-all shadow-xl gpu-accelerated",
                  user.id === profile?.id ? "ring-2 ring-primary border-primary bg-primary/5" : ""
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shrink-0",
                    i === 0 ? "bg-yellow-100 text-yellow-600" :
                    i === 1 ? "bg-zinc-200 text-zinc-600" :
                    i === 2 ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"
                  )}>{i + 1}</div>
                  <Avatar className="w-10 h-10 border-2 border-muted">
                    <AvatarImage src={`https://picsum.photos/seed/${user.id}/100`} />
                    <AvatarFallback className="font-black text-xs">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-black text-sm mb-1 italic">{user.name}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{user.level}</span>
                       <div className="flex items-center gap-1"><Flame className="w-2 h-2 text-orange-500 fill-orange-500" /><span className="text-[8px] font-black text-orange-500">{user.streak}</span></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary leading-none">{user.xp.toLocaleString()} XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* WEB VIEW */}
      <main className="hidden lg:grid grid-cols-[300px_1fr_320px] gap-8 max-w-[1600px] mx-auto p-8 ">
         <aside className="space-y-6 pb-8">
            <section className="lingua-card !bg-white/90 p-8 border-b-8 border-blue-500/20 space-y-6 shadow-2xl">
               <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest italic text-zinc-900">Your Rank</h3>
               </div>
               <div className="flex flex-col items-center py-6 space-y-4">
                  <Avatar className="w-24 h-24 border-[6px] border-white shadow-xl rounded-3xl">
                     <AvatarImage src={`https://picsum.photos/seed/${profile?.id}/200`} />
                     <AvatarFallback className="text-3xl font-black">{(profile?.name || 'S')[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                     <p className="text-2xl font-black italic text-zinc-900 tracking-tighter">#{users?.findIndex(u => u.id === profile?.id) + 1 || '--'}</p>
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Position</p>
                  </div>
               </div>
            </section>
         </aside>

         <section className="bg-white/40 backdrop-blur-xl rounded-[3.5rem] border border-white/40 shadow-2xl overflow-hidden flex flex-col relative">
            <header className="h-24 bg-zinc-900 text-white px-10 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                     <Trophy className="w-7 h-7 text-yellow-500" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black italic tracking-tighter">Global Leaderboard</h2>
                     <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">L0 Competitive Sector</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#22c55e]">
                     LIVE SYNC ACTIVE
                  </div>
               </div>
            </header>

            <div className="p-8">
               {isLoading || authLoading ? (
                  <div className="flex flex-col items-center justify-center py-40 gap-4">
                     <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                     <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Synchronizing Rankings...</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {users?.map((user, i) => (
                       <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={cn(
                             "lingua-card bg-white p-6 border-b-8 flex items-center justify-between shadow-xl group hover:scale-[1.01] transition-all gpu-accelerated",
                             user.id === profile?.id ? "border-primary ring-2 ring-primary/20" : "border-zinc-100"
                          )}
                       >
                          <div className="flex items-center gap-8">
                             <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg italic shadow-inner",
                                i === 0 ? "bg-yellow-100 text-yellow-600" :
                                i === 1 ? "bg-zinc-100 text-zinc-600" :
                                i === 2 ? "bg-orange-100 text-orange-600" : "bg-zinc-50 text-zinc-400"
                             )}>{i + 1}</div>
                             <div className="flex items-center gap-6">
                                <Avatar className="w-14 h-14 border-4 border-white shadow-lg">
                                   <AvatarImage src={`https://picsum.photos/seed/${user.id}/200`} />
                                   <AvatarFallback className="text-xl font-black">{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                   <p className="text-xl font-black italic text-zinc-900 group-hover:text-primary transition-colors">{user.name}</p>
                                   <div className="flex items-center gap-4 mt-1">
                                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{user.level} Scholar</span>
                                      <div className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-500" /><span className="text-[10px] font-black text-orange-500">{user.streak} DAY STREAK</span></div>
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="text-right flex items-center gap-6">
                             <div className="text-right">
                                <p className="text-2xl font-black italic text-primary leading-none tracking-tighter">{user.xp.toLocaleString()} XP</p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-2">{user.learnedWords?.length || 0} NODES MASTERED</p>
                             </div>
                             {user.id === profile?.id && <div className="px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-[9px] font-black text-primary uppercase">YOU</div>}
                          </div>
                       </motion.div>
                     ))}
                  </div>
               )}
            </div>
         </section>

         <aside className="space-y-6 pb-8">
            <section className="lingua-card !bg-white/90 p-8 border-b-8 border-green-500/20 space-y-6 shadow-2xl">
               <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                  <Activity className="w-5 h-5 text-[#22c55e]" />
                  <h3 className="text-sm font-black uppercase tracking-widest italic text-zinc-900">Hall of Fame</h3>
               </div>
               <div className="space-y-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4">
                     <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center"><Crown className="w-5 h-5 text-yellow-600" /></div>
                     <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Season Leader</p>
                        <p className="text-sm font-black italic text-zinc-900">{users?.[0]?.name || '--'}</p>
                     </div>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4">
                     <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Target className="w-5 h-5 text-blue-600" /></div>
                     <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Avg</p>
                        <p className="text-sm font-black italic text-zinc-900">1,450 XP</p>
                     </div>
                  </div>
               </div>
            </section>
         </aside>
      </main>
      <BottomNav />
    </div>
  );
}

