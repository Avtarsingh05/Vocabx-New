"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BookOpen, 
  Trophy, 
  User, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  Users,
  ShieldAlert,
  Gamepad2,
  Menu,
  ChevronRight,
  Zap,
  Star,
  Languages,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, detail: "Command Center" },
  { href: "/alphabets", label: "Alphabet Lab", icon: Languages, detail: "Script Explorer" },
  { href: "/curriculum", label: "Curriculum", icon: BookOpen, detail: "Learning Nodes" },
  { href: "/games", label: "Games", icon: Gamepad2, detail: "Combat Bouts" },
  { href: "/test", label: "Mastery Exam", icon: ShieldCheck, detail: "Certifications" },
  { href: "/leaderboard", label: "Hall of Fame", icon: Users, detail: "Global Rankings" },
  { href: "/profile", label: "Identity Node", icon: User, detail: "Personal Telemetry" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-2xl border-b border-white/40 z-[100] flex items-center justify-between px-4 md:px-8 shadow-xl transition-all duration-500">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-zinc-100 active:scale-90 transition-all shrink-0">
                  <Menu className="w-5 h-5 text-zinc-900" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none bg-zinc-950 text-white w-[300px] shadow-3xl">
                <div className="h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px] -mr-20 -mt-20" />
                  
                  <SheetHeader className="p-6 text-left relative z-10 border-b border-white/5">
                    <div>
                      <SheetTitle className="text-2xl font-black tracking-tighter italic text-white">
                        Vocab<span className="text-[#22c55e]">X</span>
                      </SheetTitle>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 leading-none mt-2">Scholar Protocol v3.4</p>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2 scrollbar-hide relative z-10">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link 
                          key={item.href} 
                          href={item.href} 
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group active:scale-95",
                            isActive 
                              ? "bg-[#22c55e] text-zinc-950 shadow-xl shadow-[#22c55e]/20 font-black" 
                              : "hover:bg-white/5 text-zinc-400 hover:text-white"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                            isActive ? "bg-zinc-950 text-[#22c55e]" : "bg-white/5 group-hover:bg-white/10"
                          )}>
                            <item.icon className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className="text-sm italic uppercase tracking-widest leading-none">{item.label}</p>
                            <p className={cn("text-[8px] font-bold uppercase tracking-widest mt-1 opacity-50", isActive && "text-zinc-950")}>{item.detail}</p>
                          </div>
                          {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="p-6 border-t border-white/5 bg-zinc-950/50 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="w-12 h-12 border-2 border-[#22c55e]/20">
                        <AvatarImage src={`https://picsum.photos/seed/${profile?.id}/200`} />
                        <AvatarFallback className="font-black text-xs bg-zinc-800">{profile?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black truncate">{profile?.name}</p>
                        <p className="text-[8px] font-black text-[#22c55e] uppercase tracking-widest">{profile?.level} Scholar</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleLogout}
                      variant="destructive" 
                      className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" /> EXIT TERMINAL
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/dashboard" className="flex items-center gap-1 group active:scale-95 transition-all">
            <h1 className="text-lg md:text-xl font-black text-zinc-900 tracking-tighter italic leading-none">
              Vocab<span className="text-[#22c55e]">X</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center justify-end gap-2">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 bg-zinc-950 text-white px-3 py-1.5 rounded-xl shadow-lg border-b-[3px] border-white/10 h-8 md:h-9"
          >
            <Star className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#22c55e] fill-[#22c55e] animate-pulse" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{profile?.xp || 0} XP</span>
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none active:scale-90 transition-transform">
                <div className="w-8 h-8 md:w-9 md:h-9 bg-zinc-100 rounded-xl flex items-center justify-center border border-zinc-200 shadow-inner overflow-hidden">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage src={`https://picsum.photos/seed/${profile?.id}/100`} />
                    <AvatarFallback className="bg-green-50 text-[#22c55e] font-black text-[10px]">
                      {profile?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-2 mt-4 shadow-3xl bg-white backdrop-blur-2xl border-none text-zinc-900 animate-in zoom-in-95 duration-200">
              <DropdownMenuLabel className="px-4 py-5">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-1">Scholar Identity</p>
                <p className="text-base font-black truncate italic text-zinc-900 leading-tight">{profile?.name}</p>
                <div className="mt-4 flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                  <Zap className="w-3 h-3 text-[#22c55e] fill-[#22c55e]" />
                  <span className="text-[9px] font-black text-[#22c55e] uppercase">Streak: {profile?.streak || 0} Days</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="opacity-50" />
              
              {profile?.isAdmin && (
                <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer font-bold px-4 hover:bg-red-50">
                  <Link href="/admin" className="flex items-center gap-3 w-full text-xs italic uppercase text-red-600">
                    <ShieldAlert className="w-4 h-4" /> Guardian Console
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer font-bold px-4">
                <Link href="/profile" className="flex items-center gap-3 w-full text-xs italic uppercase">
                  <User className="w-4 h-4 text-[#22c55e]" /> Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer font-bold px-4">
                <Link href="/alphabets" className="flex items-center gap-3 w-full text-xs italic uppercase">
                  <Languages className="w-4 h-4 text-blue-500" /> Alphabet Lab
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer font-bold px-4">
                <Link href="/games" className="flex items-center gap-3 w-full text-xs italic uppercase">
                  <Gamepad2 className="w-4 h-4 text-indigo-500" /> Arena
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer font-bold px-4">
                <Link href="/profile/history" className="flex items-center gap-3 w-full text-xs italic uppercase">
                  <History className="w-4 h-4 text-purple-500" /> Learning History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer font-bold px-4">
                <Link href="/leaderboard" className="flex items-center gap-3 w-full text-xs italic uppercase">
                  <Users className="w-4 h-4 text-orange-500" /> Leaderboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl h-12 cursor-pointer font-bold px-4">
                <Link href="/support" className="flex items-center gap-3 w-full text-xs italic uppercase">
                  <Trophy className="w-4 h-4 text-orange-500" /> Support Center
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-12 text-destructive cursor-pointer font-black px-4 text-xs hover:bg-red-50 uppercase tracking-widest italic">
                <LogOut className="w-4 h-4 mr-3" /> Exit Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
