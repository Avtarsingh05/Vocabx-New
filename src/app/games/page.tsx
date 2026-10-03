"use client";

import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { 
  Puzzle, 
  Zap, 
  Brain, 
  Layers, 
  ArrowLeftRight, 
  Star,
  Boxes,
  Compass,
  Repeat,
  Type,
  BrainCircuit,
  Trophy,
  LayoutDashboard,
  ShieldCheck,
  Target,
  Gamepad2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BottomNav } from '@/components/layout/BottomNav';

const GAMES = [
  { id: 'word-match', name: 'Word Match', icon: Puzzle, color: 'bg-green-500', category: 'Logic', difficulty: 'Easy', diffColor: 'bg-green-50 text-green-600', xp: 20 },
  { id: 'fill-blank', name: 'Fill Blank', icon: Type, color: 'bg-blue-400', category: 'Syntax', difficulty: 'Easy', diffColor: 'bg-blue-50 text-blue-600', xp: 20 },
  { id: 'speed-quiz', name: 'Speed Quiz', icon: Zap, color: 'bg-yellow-500', category: 'Velocity', difficulty: 'Hard', diffColor: 'bg-red-50 text-red-600', xp: 50 },
  { id: 'memory', name: 'Recall', icon: Brain, color: 'bg-pink-500', category: 'Neural', difficulty: 'Medium', diffColor: 'bg-pink-50 text-pink-600', xp: 40 },
  { id: 'drag-drop', name: 'Match Master', icon: Layers, color: 'bg-orange-500', category: 'Logic', difficulty: 'Easy', diffColor: 'bg-green-50 text-green-600', xp: 25 },
  { id: 'synonym-antonym', name: 'Opposites', icon: ArrowLeftRight, color: 'bg-red-500', category: 'Linguistic', difficulty: 'Medium', diffColor: 'bg-orange-50 text-orange-600', xp: 30 },
  { id: 'constructor', name: 'Constructor', icon: Boxes, color: 'bg-cyan-500', category: 'Syntax', difficulty: 'Hard', diffColor: 'bg-cyan-50 text-cyan-600', xp: 60 },
  { id: 'card-flip', name: 'Card Flip', icon: Repeat, color: 'bg-indigo-500', category: 'Neural', difficulty: 'Medium', diffColor: 'bg-indigo-50 text-indigo-600', xp: 35 },
  { id: 'ai-challenge', name: 'Logic Bout', icon: BrainCircuit, color: 'bg-zinc-700', category: 'Tactical', difficulty: 'Hard', diffColor: 'bg-zinc-100 text-zinc-700', xp: 60 },
  { id: 'riddle-maze', name: 'Riddle Maze', icon: Compass, color: 'bg-zinc-900', category: 'Tactical', difficulty: 'ELITE', diffColor: 'bg-zinc-900 text-white', xp: 100 },
];

export default function GamesHub() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-8 pt-16">
      <Navbar />
      
      {/* MOBILE VIEW */}
      <main className="lg:hidden max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center text-center space-y-2 mb-8 px-4"
        >
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter leading-none italic uppercase">
            Arena<span className="text-[#22c55e]">X</span>
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-50">Tactical Training Ground</p>
        </motion.header>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
          {GAMES.map((game, idx) => (
            <motion.div 
              key={game.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="gpu-accelerated"
            >
              <Link href={`/games/${game.id}`}>
                <div className="lingua-card bg-white p-2 md:p-3 flex flex-col items-center text-center space-y-2 premium-shadow hover:shadow-xl transition-all group border border-zinc-50 border-b-4 h-full min-h-[110px] justify-between">
                  <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white shadow-lg", game.color)}>
                    <game.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="space-y-1.5 w-full">
                    <h2 className="text-[9px] md:text-xs font-black uppercase tracking-tight italic leading-none text-zinc-900 truncate">{game.name}</h2>
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn("text-[6px] md:text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full", game.diffColor)}>
                        {game.difficulty}
                      </span>
                      <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full">
                         <Star className="w-1.5 h-1.5 md:w-2 md:h-2 text-[#22c55e] fill-[#22c55e]" />
                         <span className="text-[7px] md:text-[8px] font-black text-[#22c55e]">{game.xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* WEB VIEW */}
      <main className="hidden lg:grid grid-cols-[320px_1fr] gap-8 max-w-[1600px] mx-auto p-8 mt-16 min-h-[calc(100vh-64px)]">
         <aside className="space-y-6 scrollbar-hide pb-8">
            <section className="lingua-card !bg-white/90 p-8 border-b-8 border-green-500/20 space-y-6 shadow-2xl">
               <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                  <Gamepad2 className="w-5 h-5 text-[#22c55e]" />
                  <h3 className="text-sm font-black uppercase tracking-widest italic text-zinc-900">Arena Stats</h3>
               </div>
               <div className="space-y-4">
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Wins</p>
                     <p className="text-2xl font-black italic text-zinc-900">142</p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">XP Unlocked</p>
                     <p className="text-2xl font-black italic text-[#22c55e]">2.4K</p>
                  </div>
               </div>
            </section>

            <section className="space-y-2">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] px-4">Categories</p>
               {Array.from(new Set(GAMES.map(g => g.category))).map((cat, i) => (
                 <div key={i} className="flex items-center justify-between px-6 py-3 bg-white/50 hover:bg-white rounded-2xl transition-all cursor-pointer group">
                    <span className="font-black text-xs uppercase tracking-widest italic text-zinc-500 group-hover:text-zinc-900">{cat}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-30" />
                 </div>
               ))}
            </section>
         </aside>

         <section className="space-y-8 scrollbar-hide pb-20">
            <header className="flex justify-between items-end px-4">
               <div>
                  <h1 className="text-5xl font-black tracking-tighter italic text-zinc-900">Arena Terminal</h1>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.5em] mt-2">Tactical Intelligence Training Sector</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="px-6 py-2 bg-[#22c55e] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                     ELITE ACCESS ACTIVE
                  </div>
               </div>
            </header>

            <div className="grid grid-cols-3 gap-6 px-4">
               {GAMES.map((game, idx) => (
                 <motion.div
                    key={game.id}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="gpu-accelerated"
                 >
                    <Link href={`/games/${game.id}`}>
                       <div className="lingua-card bg-white p-8 border-b-[12px] shadow-2xl group flex flex-col justify-between min-h-[280px]">
                          <div className="space-y-6">
                             <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform", game.color)}>
                                <game.icon className="w-8 h-8" />
                             </div>
                             <div>
                                <h3 className="text-2xl font-black italic tracking-tighter text-zinc-900 leading-tight">{game.name}</h3>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">{game.category} • {game.difficulty}</p>
                             </div>
                          </div>
                          <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                             <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-xl">
                                <Star className="w-3.5 h-3.5 text-[#22c55e] fill-[#22c55e]" />
                                <span className="text-xs font-black text-[#22c55e]">{game.xp} XP UNITS</span>
                             </div>
                             <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:translate-x-2 transition-transform">
                                <ChevronRight className="w-6 h-6" />
                             </div>
                          </div>
                       </div>
                    </Link>
                 </motion.div>
               ))}
            </div>
         </section>
      </main>
      <BottomNav />
    </div>
  );
}

