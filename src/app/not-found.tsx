
"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ChevronLeft, SearchX, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

/**
 * Premium 404 Recovery Page
 * Provides a graceful way back to the main terminal when a route is missing.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Navbar />
      
      <main className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500 pt-20">
        <div className="relative inline-block">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-40 h-40 bg-zinc-900 rounded-[3rem] flex items-center justify-center mx-auto border-b-[12px] border-primary/20 shadow-2xl"
          >
            <SearchX className="w-20 h-20 text-primary" />
          </motion.div>
          <div className="absolute -bottom-2 -right-2 bg-destructive text-white p-3 rounded-2xl shadow-xl border-4 border-white rotate-12">
            <Zap className="w-5 h-5 fill-white" />
          </div>
        </div>

        <div className="space-y-3 px-4">
          <h1 className="text-5xl font-black text-foreground tracking-tighter italic uppercase leading-none">
            Link<span className="text-zinc-950">404</span>
          </h1>
          <p className="text-xl font-bold text-muted-foreground">Neural Link Severed</p>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">
            The requested knowledge node does not exist or has been archived.
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-white/40 p-6 rounded-[2.5rem] shadow-2xl premium-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <p className="text-left text-[11px] font-bold text-zinc-600 leading-tight">
              Don't worry, Scholar. Your progress is safe. Re-synchronize with the primary command center to continue your evolution.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="lingua-button lingua-button-primary h-16 text-lg shadow-xl shadow-primary/20">
              <Link href="/dashboard">
                RETURN TO HUB
              </Link>
            </Button>
            <Button variant="ghost" asChild className="h-12 font-black text-[10px] uppercase tracking-widest text-muted-foreground">
              <Link href="/support">
                CONTACT COMMAND
              </Link>
            </Button>
          </div>
        </div>

        <footer className="opacity-30">
          <p className="text-[8px] font-black uppercase tracking-[0.5em]">VocabX Protocol • Error: 404</p>
        </footer>
      </main>
    </div>
  );
}
