
"use client";

import { Flame, Trophy, Star } from "lucide-react";
import { UserProfile } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressCardsProps {
  profile: UserProfile;
}

export function ProgressCards({ profile }: ProgressCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 xs:gap-3 md:gap-6">
      <StatCard 
        icon={<Flame className="w-5 h-5 md:w-8 md:h-8" />} 
        label="Streak" 
        value={profile.streak} 
        color="orange" 
        delay={0.1}
      />
      <StatCard 
        icon={<Star className="w-5 h-5 md:w-8 md:h-8" />} 
        label="XP Units" 
        value={profile.xp} 
        color="green" 
        delay={0.2}
      />
      <StatCard 
        icon={<Trophy className="w-5 h-5 md:w-8 md:h-8" />} 
        label="Rank" 
        value={profile.level} 
        color="blue" 
        delay={0.3}
      />
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }: { icon: React.ReactNode, label: string, value: string | number, color: 'orange' | 'green' | 'blue', delay: number }) {
  const themes = {
    orange: "border-b-[#f97316] text-[#f97316] bg-orange-50/10",
    green: "border-b-[#22c55e] text-[#22c55e] bg-green-50/10",
    blue: "border-b-[#3b82f6] text-[#3b82f6] bg-blue-50/10",
  };

  const iconThemes = {
    orange: "bg-orange-50 text-orange-500 border-orange-100",
    green: "bg-green-50 text-green-500 border-green-100",
    blue: "bg-blue-50 text-blue-500 border-blue-100",
  }

  const stringValue = String(value);
  const isLongValue = stringValue.length >= 8;

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "lingua-card flex flex-col items-center justify-center gap-1 text-center p-3.5 md:p-8 bg-white/95 border-b-[8px] md:border-b-[12px] shadow-2xl group overflow-hidden w-full",
        themes[color].split(' ')[0], themes[color].split(' ')[1]
      )}
    >
      <div className={cn(
        "mb-2 p-2 rounded-2xl border transition-transform duration-500 group-hover:rotate-6",
        iconThemes[color]
      )}>
        {icon}
      </div>
      <div className="w-full overflow-hidden flex flex-col items-center">
        <p className={cn(
          "font-black leading-none truncate italic tracking-tighter text-zinc-900 px-1 transition-all", 
          isLongValue ? "text-[10px] xs:text-[11px] md:text-xl" : "text-sm xs:text-base md:text-3xl"
        )}>
          {value}
        </p>
        <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] leading-none mt-2.5 text-muted-foreground group-hover:text-zinc-600 transition-colors">{label}</p>
      </div>
    </motion.div>
  );
}
