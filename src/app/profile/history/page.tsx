"use client";

import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, History, BookOpen, Calendar, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";

export default function HistoryPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background p-6 pt-8 space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const filteredWords = (profile.learnedWords || [])
    .filter(w => w.word.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background pb-32 pt-8">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-500 pt-safe">
        <header className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-12 w-12 hover:bg-muted"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <History className="w-7 h-7 text-primary" /> Mastery
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Vocabulary Bank</p>
          </div>
        </header>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Search your words..." 
            className="h-14 pl-12 rounded-2xl border-2 border-muted focus-visible:ring-primary text-lg font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <section className="space-y-4">
          {filteredWords.length > 0 ? (
            filteredWords.map((word, idx) => (
              <div key={idx} className="lingua-card border-b-8 bg-white p-6 space-y-4 group">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{word.word}</h2>
                    <div className="flex items-center gap-2 bg-muted/50 px-2 py-0.5 rounded-lg w-fit">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{word.level}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(word.date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-lg font-bold leading-tight text-foreground/80">{word.meaning}</p>
                  <div className="p-3 bg-primary/5 rounded-xl border-l-4 border-primary/30">
                    <p className="text-sm font-medium italic text-muted-foreground">"{word.example}"</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center mx-auto text-muted-foreground">
                <BookOpen className="w-10 h-10" />
              </div>
              <p className="text-xl font-black text-muted-foreground">No words found.</p>
              <Button onClick={() => router.push('/learn')} className="lingua-button lingua-button-primary h-12 px-8">
                LEARN NOW
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}