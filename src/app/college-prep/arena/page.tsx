"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { 
  Code2, 
  Terminal, 
  Cpu, 
  FileCode, 
  Smartphone,
  ChevronRight,
  Zap,
  ShieldCheck,
  Layout
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ARENA_LANGS = [
  { id: 'python', name: 'Python Terminal', icon: Terminal, color: 'text-yellow-500', bg: 'bg-yellow-50', level: 'Core' },
  { id: 'javascript', name: 'JS Node', icon: Code2, color: 'text-blue-500', bg: 'bg-blue-50', level: 'Web' },
  { id: 'java', name: 'Java Vault', icon: Coffee, color: 'text-red-500', bg: 'bg-red-50', level: 'Enterprise' },
  { id: 'cpp', name: 'C++ Sector', icon: Cpu, color: 'text-indigo-500', bg: 'bg-indigo-50', level: 'System' },
];

function Coffee(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
  );
}

export default function CodeArenaHub() {
  return (
    <div className="min-h-screen bg-background pb-32 pt-20">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-700">
        <header className="text-center space-y-4">
           <div className="terminal-label mx-auto bg-primary text-white border-none shadow-xl">
             <Zap className="w-3 h-3 fill-white" />
             <span>Combat Simulation Protocol Active</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-zinc-900 leading-none">
             Code Arena<span className="text-primary">X</span>
           </h1>
           <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.5em] opacity-60">Logic Verification & Combat Hub</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARENA_LANGS.map((lang, i) => (
            <motion.div
              key={lang.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Link href={`/college-prep/arena/${lang.id}`}>
                <div className="lingua-card bg-white p-8 border-b-[12px] shadow-2xl flex flex-col items-center text-center gap-6 group-hover:border-primary transition-all min-h-[300px] justify-center">
                  <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner", lang.bg)}>
                    <lang.icon className={cn("w-10 h-10", lang.color)} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic text-zinc-900 leading-tight">{lang.name}</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{lang.level} Complexity Node</p>
                  </div>
                  <div className="w-full pt-6 border-t border-zinc-50 flex items-center justify-between">
                     <span className="text-[9px] font-black uppercase text-primary">Engage Combat</span>
                     <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                       <ChevronRight className="w-6 h-6" />
                     </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <section className="bg-zinc-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-primary/20">
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -mr-40 -mt-40" />
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Global Code<br/>Gauntlet</h3>
                <p className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xl">
                  Solve 30+ industry-aligned challenges. Our AI-driven system verifies your logic and provides simulated outputs in real-time. Rise through the ranks and earn Elite Developer status.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logic Verified</span>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Multi-IDE Support</span>
                  </div>
                </div>
              </div>
              <div className="w-40 h-40 bg-primary/20 rounded-[3rem] border border-primary/30 flex items-center justify-center rotate-6 shadow-3xl animate-float">
                <Terminal className="w-20 h-20 text-primary" />
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}

