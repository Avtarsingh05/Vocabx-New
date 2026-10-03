"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { 
  Code2, 
  Terminal, 
  Database, 
  Globe, 
  Cpu, 
  Blocks, 
  FileCode, 
  Smartphone,
  ChevronRight,
  Sparkles,
  Search,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  { id: 'python', name: 'Python', icon: Terminal, color: 'text-yellow-600', bg: 'bg-yellow-50', nodes: 120 },
  { id: 'javascript', name: 'JavaScript', icon: Code2, color: 'text-blue-600', bg: 'bg-blue-50', nodes: 150 },
  { id: 'java', name: 'Java', icon: Coffee, color: 'text-red-600', bg: 'bg-red-50', nodes: 110 },
  { id: 'react', name: 'React', icon: Blocks, color: 'text-cyan-600', bg: 'bg-cyan-50', nodes: 105 },
  { id: 'cpp', name: 'C++', icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50', nodes: 100 },
  { id: 'html-css', name: 'HTML/CSS', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50', nodes: 130 },
  { id: 'csharp', name: 'C#', icon: FileCode, color: 'text-purple-600', bg: 'bg-purple-50', nodes: 90 },
  { id: 'dart', name: 'Dart/Flutter', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50/50', nodes: 85 },
];

function Coffee(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
  );
}

export default function CollegePrepPage() {
  const [search, setSearch] = useState("");

  const filtered = SUBJECTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-10 pt-24 md:pt-20 pt-safe">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-8 pt-2 md:pt-8 space-y-8 animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 px-1">
          <div className="space-y-1.5 md:space-y-2">
            <div className="terminal-label mt-2 md:mt-0 bg-zinc-950 md:bg-indigo-600 text-white border-none shadow-xl py-1 px-3">
              <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 fill-white" />
              <span className="text-[8px] md:text-[10px]">Professional Sector Active</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-zinc-900 leading-none">
              College Prep<span className="text-indigo-600">X</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] md:tracking-[0.4em] mt-1 opacity-80">Career Trajectory Synchronization</p>
          </div>

          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
            <Input 
              placeholder="Search stack..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-12 rounded-2xl border-2 border-muted focus-visible:ring-indigo-500 font-bold bg-white shadow-sm"
            />
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {filtered.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 + 0.1 }}
              whileHover={{ y: -8 }}
              className="group gpu-accelerated"
            >
              <Link href={`/college-prep/${sub.id}`}>
                <div className="lingua-card bg-white p-4 md:p-6 border-b-[10px] flex flex-col justify-between min-h-[180px] md:min-h-[220px] shadow-xl group-hover:border-indigo-500 transition-all border-muted/50">
                  <div className="space-y-3 md:space-y-4">
                    <div className={cn("w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner", sub.bg)}>
                      <sub.icon className={cn("w-5 h-5 md:w-8 md:h-8", sub.color)} />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-black italic text-zinc-900 leading-tight">{sub.name}</h2>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{sub.nodes} Nodes</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-zinc-100">
                    <span className="text-[8px] font-black uppercase text-indigo-600 tracking-wider">Enter Terminal</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="gpu-accelerated pt-6"
        >
          <Link href="/college-prep/arena">
            <div className="lingua-card bg-zinc-900 text-white p-6 md:p-10 border-b-[12px] border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl group hover:scale-[1.01] transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center border border-primary/20 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                     <Code2 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  </div>
                  <div>
                     <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">Code Combat Arena</h2>
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2 opacity-80">Logic Verification & Combat Hub</p>
                  </div>
               </div>
               <div className="w-full md:w-auto relative z-10">
                  <div className="h-14 md:h-16 px-8 md:px-10 bg-primary text-zinc-950 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-3 group-hover:gap-5 transition-all shadow-xl shadow-primary/20 active:scale-95">
                     ENGAGE COMBAT <ChevronRight className="w-5 h-5 stroke-[3px]" />
                  </div>
               </div>
            </div>
          </Link>
        </motion.div>

        <section className="bg-zinc-950 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-indigo-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6 text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter leading-tight uppercase">Technical<br/>Mastery Exam</h2>
              <p className="text-xs md:text-sm font-medium text-zinc-400 leading-relaxed max-w-md mx-auto md:mx-0">
                Verify your professional proficiency through our rigorous certification nodes. Earn industry-aligned credentials for your portfolio.
              </p>
              <button className="w-full md:w-auto h-14 px-8 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all active:scale-95">
                UNLOCK CERTIFICATION
              </button>
            </div>
            <div className="hidden md:flex justify-center">
               <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center rotate-6 shadow-2xl">
                 <ShieldCheck className="w-16 h-16 md:w-24 md:h-24 text-indigo-500 animate-pulse" />
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

