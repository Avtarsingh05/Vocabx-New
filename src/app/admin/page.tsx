
"use client";

import { useAuth } from "@/hooks/use-auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, Zap, Trophy, TrendingUp, BarChart2, Activity, Target, Clock, UserPlus, ArrowUpRight, BrainCircuit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    dau: 0,
    wau: 0,
    accuracy: 0,
    quizzes: 0,
    remainingCycles: 842,
    totalLimit: 1000
  });

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const total = usersSnap.size;
      
      const usageSnap = await getDoc(doc(db, "ai_usage", "global"));
      const usageData = usageSnap.exists() ? usageSnap.data() : { remainingCycles: 842, totalLimit: 1000 };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();
      
      const activeToday = usersSnap.docs.filter(d => {
        const lastActive = d.data().lastActiveDate;
        return lastActive && lastActive >= todayIso;
      }).length;

      setStats({
        totalUsers: total,
        activeToday: activeToday,
        dau: activeToday,
        wau: Math.floor(total * 0.4),
        accuracy: 78,
        quizzes: total * 15,
        remainingCycles: usageData.remainingCycles,
        totalLimit: usageData.totalLimit
      });
    };
    fetchStats();
  }, []);

  const growthData = [
    { name: 'Jan', users: 400 },
    { name: 'Feb', users: 600 },
    { name: 'Mar', users: 900 },
    { name: 'Apr', users: 1400 },
    { name: 'May', users: 2100 },
    { name: 'Jun', users: stats.totalUsers || 2500 },
  ];

  const activityData = [
    { time: '08:00', active: 450 },
    { time: '12:00', active: 890 },
    { time: '16:00', active: 670 },
    { time: '20:00', active: 980 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic text-zinc-900">Command Center</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-1">Platform Telemetry & Neural Nodes</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl font-black text-[10px] border border-primary/20 w-fit">
          <Activity className="w-3.5 h-3.5" /> LIVE NODES ACTIVE
        </div>
      </header>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Scholars" 
          value={stats.totalUsers.toLocaleString()} 
          icon={<Users className="w-5 h-5" />} 
          trend="+12%" 
          color="blue"
        />
        <StatCard 
          label="Neural Quota" 
          value={`${stats.remainingCycles}`} 
          icon={<BrainCircuit className="w-5 h-5" />} 
          trend={`${((stats.remainingCycles / stats.totalLimit) * 100).toFixed(0)}%`} 
          color="green"
        />
        <StatCard 
          label="Mega Quizzes" 
          value={stats.quizzes.toLocaleString()} 
          icon={<Trophy className="w-5 h-5" />} 
          trend="Avg 15" 
          color="orange"
        />
        <StatCard 
          label="Avg Accuracy" 
          value={`${stats.accuracy}%`} 
          icon={<Target className="w-5 h-5" />} 
          trend="Stable" 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-muted/50 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 italic">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Scholar Growth
            </h2>
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Monthly Data</div>
          </div>
          <div className="h-[220px] md:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-muted/50 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 italic">
              <BarChart2 className="w-5 h-5 text-green-500" /> Neural Pulse
            </h2>
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Hourly Traffic</div>
          </div>
          <div className="h-[220px] md:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                <Bar dataKey="active" fill="hsl(var(--primary))" radius={[8, 8, 8, 8]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-muted/50">
          <h2 className="text-xl font-black mb-6 italic">Recent Enlistments</h2>
          <div className="space-y-3">
             {[1,2,3,4].map(i => (
               <div key={i} className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-muted/50 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-muted font-black text-[10px] group-hover:bg-primary group-hover:text-white transition-colors shrink-0 shadow-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-sm truncate">Scholar_{i * 231}</p>
                      <p className="text-[9px] font-black text-muted-foreground uppercase">Linked Email • {i}m ago</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
               </div>
             ))}
          </div>
        </div>

        <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between border-b-[10px] border-primary/20 min-h-[280px]">
           <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -mr-20 -mt-20" />
           <div className="space-y-2 relative z-10">
             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <Clock className="w-6 h-6 text-primary" />
             </div>
             <h2 className="text-2xl font-black leading-tight italic tracking-tighter">GLOBAL OPS TERMINAL</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">System integrity active</p>
           </div>
           
           <div className="space-y-5 mt-12 relative z-10">
             <div className="space-y-2">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="opacity-60">Server Load</span>
                 <span className="text-primary">12.4%</span>
               </div>
               <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[12.4%]" />
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="opacity-60">Neural Latency</span>
                 <span className="text-primary">145ms</span>
               </div>
               <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[35%]" />
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, color }: { label: string, value: string, icon: React.ReactNode, trend: string, color: string }) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <Card className="rounded-[2rem] p-6 bg-white border border-muted/50 shadow-sm space-y-4 hover:scale-[1.02] transition-transform active:scale-95 cursor-default group">
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-2xl border-2 transition-all group-hover:scale-110", colorMap[color])}>
          {icon}
        </div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
          {trend} <ArrowUpRight className="w-2.5 h-2.5 opacity-50" />
        </div>
      </div>
      <div>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-black tracking-tighter italic">{value}</p>
      </div>
    </Card>
  );
}
