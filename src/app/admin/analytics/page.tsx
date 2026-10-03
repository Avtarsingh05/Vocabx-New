
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Brain,
  History,
  Loader2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.isAdmin !== true) return;

    const fetchAnalytics = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const users = usersSnap.docs.map(doc => doc.data());
        
        const streaks = {
          "0-3d": users.filter(u => (u.streak || 0) <= 3).length,
          "4-10d": users.filter(u => (u.streak || 0) > 3 && (u.streak || 0) <= 10).length,
          "11-30d": users.filter(u => (u.streak || 0) > 10 && (u.streak || 0) <= 30).length,
          "30d+": users.filter(u => (u.streak || 0) > 30).length,
        };

        const streakData = Object.entries(streaks).map(([name, value]) => ({ name, value }));

        const difficultWords = [
          { word: "Ephemeral", errorRate: 64 },
          { word: "Pragmatic", errorRate: 58 },
          { word: "Resilient", errorRate: 45 },
          { word: "Ambiguous", errorRate: 42 },
          { word: "Inevitability", errorRate: 38 },
        ];

        setStats({
          totalUsers: users.length,
          streakData,
          difficultWords,
          avgAccuracy: 76.4,
          retentionRate: 82.1,
          avgSessionTime: "14m 22s"
        });
      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [profile]);

  const accuracyData = [
    { day: 'M', accuracy: 72 },
    { day: 'T', accuracy: 75 },
    { day: 'W', accuracy: 74 },
    { day: 'T', accuracy: 78 },
    { day: 'F', accuracy: 82 },
    { day: 'S', accuracy: 80 },
    { day: 'S', accuracy: 84 },
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

  if (profile?.isAdmin !== true) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-[#22c55e] w-12 h-12 mb-4" />
        <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">Synchronizing Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-safe">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-4 italic text-zinc-900">
            <BarChart3 className="w-10 h-10 text-[#22c55e]" /> Behavioral Insights
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-3 opacity-50">L0 Scholar Telemetry Node</p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <InsightCard label="Retention" value="82.1%" trend="+2.4%" up={true} icon={<Users className="w-5 h-5" />} />
         <InsightCard label="Avg Session" value="14m 22s" trend="-0.5%" up={false} icon={<History className="w-5 h-5" />} />
         <InsightCard label="Neural Growth" value="+142" trend="Words/d" up={true} icon={<Brain className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.section 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lingua-card bg-white p-8 space-y-8 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3">
              <Target className="w-6 h-6 text-[#22c55e]" /> Accuracy Velocity
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} domain={[60, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }} 
                />
                <Area type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={5} fillOpacity={1} fill="url(#colorAcc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lingua-card bg-white p-8 space-y-8 premium-shadow"
        >
          <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3 text-zinc-900">
            <Activity className="w-6 h-6 text-blue-500" /> Scholar Retention
          </h2>
          <div className="h-[300px] w-full flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="w-full h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={stats?.streakData || []} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={90} 
                    paddingAngle={8} 
                    dataKey="value"
                    animationBegin={500}
                    animationDuration={1500}
                  >
                    {(stats?.streakData || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <p className="text-2xl font-black italic text-zinc-900">{stats?.totalUsers}</p>
              </div>
            </div>
            <div className="space-y-3 w-full sm:w-auto px-6">
               {stats?.streakData?.map((entry: any, i: number) => (
                 <div key={i} className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 whitespace-nowrap">{entry.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </motion.section>

        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 lingua-card !bg-zinc-950 text-white p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/10 rounded-full blur-[100px]" />
           <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
                    <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
                 </div>
                 <div>
                    <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none">Critical Failure Matrix</h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#22c55e] mt-3">Neural Obstacles</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                 {stats?.difficultWords?.map((word: any, i: number) => (
                   <motion.div 
                     key={i} 
                     whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                     className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-6 transition-all group"
                   >
                      <p className="text-xl font-black italic group-hover:text-[#22c55e] transition-colors truncate">{word.word}</p>
                      <div className="space-y-2">
                         <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-red-500">{word.errorRate}%</span>
                            <ArrowUpRight className="w-5 h-5 text-red-500 mb-1.5 opacity-50" />
                         </div>
                         <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${word.errorRate}%` }}
                             transition={{ duration: 1.5, delay: 0.5 + i * 0.1 }}
                             className="h-full bg-gradient-to-r from-red-500 to-orange-500" 
                           />
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </motion.section>
      </div>
    </div>
  );
}

function InsightCard({ label, value, trend, up, icon }: { label: string, value: string, trend: string, up: boolean, icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="lingua-card bg-white p-6 premium-shadow flex items-center justify-between group transition-all"
    >
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-[#22c55e]/10 group-hover:text-[#22c55e] transition-colors shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black italic text-zinc-900">{value}</p>
        </div>
      </div>
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm",
        up ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
      )}>
        {trend}
      </div>
    </motion.div>
  );
}
