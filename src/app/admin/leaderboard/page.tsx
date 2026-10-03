
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, orderBy, limit, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMemoFirebase } from "@/firebase/provider";
import { 
  Trophy, 
  Medal, 
  Star, 
  Flame, 
  ShieldAlert, 
  RefreshCw, 
  Search, 
  Award,
  Crown,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function AdminLeaderboardPage() {
  const { profile: adminProfile } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const leaderboardQuery = useMemoFirebase(() => {
    if (!adminProfile?.isAdmin) return null;
    return query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
  }, [adminProfile]);

  const { data: users, isLoading } = useCollection(leaderboardQuery);

  const filteredUsers = users?.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleResetXP = async (user: any) => {
    if (!confirm(`Reset XP for ${user.name}?`)) return;
    setIsProcessing(user.id);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { xp: 0 });
      toast({ title: "Scholar Reset", description: "XP purged from the rankings." });
    } catch (err) {
      toast({ title: "Operation Failed", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  if (adminProfile?.isAdmin !== true) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-safe">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-3 italic">
            <Trophy className="w-10 h-10 text-secondary" /> Hall of Fame Control
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-2 opacity-50">L0 Competitive Matrix</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => toast({ title: "Global Reset Initiated" })} variant="outline" className="h-14 px-6 rounded-2xl border-2 font-black text-xs uppercase tracking-widest hover:bg-secondary/10 hover:text-secondary hover:border-secondary transition-all">
            <RefreshCw className="mr-2 w-4 h-4" /> WEEKLY RESET
          </Button>
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Locate scholar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 w-full md:w-64 rounded-2xl border-2 border-muted focus-visible:ring-primary shadow-sm font-bold"
            />
          </div>
        </div>
      </header>

      {/* Podium Visualization - Horizontal scroll on mobile */}
      <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {users && users.slice(0, 3).map((user, i) => (
          <div key={user.id} className="min-w-[280px] md:min-w-0 flex-1">
            <PodiumCard user={user} rank={i + 1} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-muted/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Synchronizing Rankings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <div className="min-w-[700px]">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b-2">
                  <tr>
                    <th className="text-left font-black uppercase text-[10px] tracking-widest h-14 pl-8">Rank</th>
                    <th className="text-left font-black uppercase text-[10px] tracking-widest h-14">Scholar</th>
                    <th className="text-left font-black uppercase text-[10px] tracking-widest h-14">Node</th>
                    <th className="text-left font-black uppercase text-[10px] tracking-widest h-14">Score</th>
                    <th className="text-right font-black uppercase text-[10px] tracking-widest h-14 pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  {filteredUsers?.map((user, i) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="pl-8 py-5">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm",
                          i === 0 ? "bg-yellow-100 text-yellow-600" :
                          i === 1 ? "bg-zinc-200 text-zinc-600" :
                          i === 2 ? "bg-orange-100 text-orange-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {i + 1}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-muted group-hover:border-primary/30 transition-colors">
                            <AvatarImage src={`https://picsum.photos/seed/${user.id}/100`} />
                            <AvatarFallback className="font-black text-xs">{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="max-w-[150px]">
                            <p className="font-black text-sm italic truncate">{user.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{user.level || 'Scholar'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                          <span className="text-sm font-black text-primary">{user.xp.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="text-right pr-8">
                         <Button variant="ghost" size="icon" onClick={() => handleResetXP(user)} disabled={isProcessing === user.id} className="rounded-xl h-10 w-10 text-muted-foreground hover:text-red-600 hover:bg-red-50">
                           {isProcessing === user.id ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumCard({ user, rank }: { user: any, rank: number }) {
  const rankColors: any = {
    1: "border-yellow-400 bg-yellow-50/30",
    2: "border-zinc-300 bg-zinc-50/30",
    3: "border-orange-400 bg-orange-50/30",
  };

  const Icon: any = { 1: Crown, 2: Award, 3: Medal }[rank];

  return (
    <Card className={cn("rounded-[2.5rem] p-8 border-b-8 shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-all", rankColors[rank])}>
      <div className="absolute top-4 left-4">
        <Icon className={cn("w-6 h-6", rank === 1 ? "text-yellow-600 animate-bounce" : "text-muted-foreground")} />
      </div>
      <Avatar className="w-16 h-16 md:w-20 md:h-20 border-4 border-white shadow-xl">
        <AvatarImage src={`https://picsum.photos/seed/${user.id}/200`} />
        <AvatarFallback className="text-2xl font-black">{user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h3 className="text-xl font-black italic truncate max-w-[150px]">{user.name}</h3>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{user.level}</p>
      </div>
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-muted shadow-inner">
        <Star className="w-4 h-4 text-primary fill-primary" />
        <span className="text-lg font-black text-primary">{user.xp.toLocaleString()}</span>
      </div>
    </Card>
  );
}
