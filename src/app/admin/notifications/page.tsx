
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Send, Users, User, Clock, CheckCircle2, RefreshCw, AlertCircle, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [targetType, setTargetType] = useState<"broadcast" | "individual">("broadcast");
  const [targetUserId, setTargetUserId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [recentAlerts, setRecentAlerts] = useState([
    {
      id: "1",
      message: "Weekly challenge starts in 1 hour! Ready your lexicons.",
      type: "broadcast",
      createdAt: new Date(Date.now() - 1800000),
      senderName: "System Admin"
    },
    {
      id: "2",
      message: "Your streak is at risk! Complete a lesson now.",
      type: "individual",
      createdAt: new Date(Date.now() - 3600000),
      senderName: "Guardian Node"
    }
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newAlert = {
        id: Date.now().toString(),
        message: message.trim(),
        type: targetType,
        createdAt: new Date(),
        senderName: profile?.name || "Admin"
      };
      setRecentAlerts(prev => [newAlert, ...prev]);
      toast({ title: "Signal Dispatched" });
      setMessage("");
      setTargetUserId("");
      setSending(false);
    }, 1200);
  };

  if (profile?.isAdmin !== true) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-700 p-4">
        <Bell className="w-16 h-16 text-destructive mb-4 opacity-20" />
        <h2 className="text-2xl font-black italic tracking-tighter">Transmission Restricted</h2>
        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em]">Guardian Clearance Required</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 animate-in fade-in duration-700 pb-safe">
      <div className="lg:col-span-2 space-y-8">
        <header>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="px-2 py-1 bg-primary/20 rounded text-[8px] font-black text-primary uppercase tracking-widest border border-primary/20">
              Simulation Node Active
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic flex items-center gap-3">
             <Send className="w-8 h-8 md:w-10 md:h-10 text-primary" /> Signal Dispatcher
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-2 opacity-50">Broadcast direct alerts</p>
        </header>

        <section className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-muted/50 space-y-6 md:space-y-8 relative overflow-hidden group">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative z-10">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Target Frequency</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={targetType === 'broadcast' ? 'default' : 'outline'} onClick={() => setTargetType('broadcast')} className={cn("h-12 md:h-14 rounded-2xl font-black border-2 transition-all text-[10px]", targetType === 'broadcast' ? "bg-primary border-primary text-white" : "border-muted")}>
                  BROADCAST
                </Button>
                <Button variant={targetType === 'individual' ? 'default' : 'outline'} onClick={() => setTargetType('individual')} className={cn("h-12 md:h-14 rounded-2xl font-black border-2 transition-all text-[10px]", targetType === 'individual' ? "bg-primary border-primary text-white" : "border-muted")}>
                  SPECIFIC
                </Button>
              </div>
            </div>
            {targetType === 'individual' && (
              <div className="space-y-2 animate-in zoom-in-95 duration-300">
                <Label className="text-[9px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Target UID</Label>
                <Input value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="Node ID..." className="h-12 md:h-14 rounded-2xl border-2 border-muted font-bold px-4 focus-visible:ring-primary shadow-inner" />
              </div>
            )}
          </div>

          <div className="space-y-2 relative z-10">
            <Label className="text-[9px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Signal Content</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type signal content..." className="min-h-[140px] md:min-h-[180px] rounded-[1.5rem] border-2 border-muted p-6 text-base font-medium focus:border-primary transition-all shadow-inner bg-muted/5" />
          </div>

          <Button onClick={handleSend} disabled={sending || !message.trim() || (targetType === 'individual' && !targetUserId)} className="w-full h-16 md:h-20 rounded-[1.5rem] lingua-button lingua-button-primary text-lg shadow-2xl shadow-primary/30 relative z-10">
            {sending ? <RefreshCw className="animate-spin mr-3 w-6 h-6" /> : <Terminal className="mr-3 w-6 h-6" />}
            TRANSMIT SIGNAL
          </Button>
        </section>
      </div>

      <aside className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-2 italic">
          <Clock className="w-5 h-5 text-primary" /> Transmission Log
        </h2>
        <div className="space-y-4">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-muted/50 group hover:border-primary/20 transition-all">
               <div className="flex justify-between items-start mb-2">
                  <div className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest", alert.type === 'broadcast' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600")}>
                    {alert.type}
                  </div>
                  <span className="text-[8px] font-black text-muted-foreground uppercase">
                    {alert.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
               </div>
               <p className="text-sm font-bold leading-relaxed mb-4 italic text-zinc-800">"{alert.message}"</p>
               <div className="flex items-center gap-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Verified Node
               </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
