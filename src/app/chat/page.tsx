"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { chatWithTeacher } from "@/ai/flows/ai-teacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Sparkles, Loader2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: "Hi! I'm your AI Teacher. Ask me anything about your target language, grammar, or vocabulary!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !profile) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const result = await chatWithTeacher({
        message: userMsg,
        history: messages,
        targetLanguage: profile.targetLanguage,
        level: profile.level
      });

      setMessages(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-14">
      <Navbar />
      <main className="max-w-2xl mx-auto h-[calc(100vh-9rem)] flex flex-col p-4 animate-in fade-in duration-500">
        <header className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">AI Teacher</h1>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Always Online</p>
          </div>
        </header>

        <ScrollArea className="flex-1 lingua-card bg-white p-4 mb-4 border-b-8" viewportRef={scrollRef}>
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <Avatar className="w-8 h-8 shrink-0">
                  {m.role === 'user' ? (
                    <AvatarFallback className="bg-muted text-[10px] font-black">YOU</AvatarFallback>
                  ) : (
                    <div className="bg-primary/20 w-full h-full flex items-center justify-center text-primary">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </Avatar>
                <div className={cn(
                  "p-3 rounded-2xl max-w-[80%] text-sm font-medium leading-relaxed",
                  m.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-muted/50 text-foreground rounded-tl-none"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center text-primary animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted/50 p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="h-14 rounded-2xl border-2 border-muted focus-visible:ring-primary text-base font-bold"
          />
          <Button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-14 h-14 rounded-2xl lingua-button lingua-button-primary shrink-0 p-0"
          >
            <Send className="w-6 h-6" />
          </Button>
        </div>
      </main>
    </div>
  );
}
