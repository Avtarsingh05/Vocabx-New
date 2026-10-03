
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, BrainCircuit, BarChart3, Trophy, Bell, Settings, History, ShieldAlert, LogOut, ChevronRight, Terminal, Globe, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/users", label: "Scholars", icon: Users },
  { href: "/admin/ai", label: "AI Control", icon: BrainCircuit },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin/notifications", label: "Alerts", icon: Bell },
  { href: "/admin/settings", label: "System", icon: Settings },
  { href: "/admin/logs", label: "Activity Logs", icon: History },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!profile || profile.isAdmin !== true)) {
      router.push("/dashboard");
    }
  }, [profile, loading, router]);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Terminal className="animate-pulse text-primary w-12 h-12" />
      </div>
    );
  }

  if (!profile || profile.isAdmin !== true) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        <Sidebar className="border-r-0 shadow-2xl bg-zinc-900 text-white" collapsible="icon">
          <SidebarHeader className="p-6">
            <Link href="/admin" className="flex items-center gap-3 px-2 group">
              <div className="overflow-hidden transition-all group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                <h1 className="text-xl font-black tracking-tighter leading-none italic text-primary">
                  Vocab<span className="text-white">X</span>
                </h1>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">Control Panel</p>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarMenu>
              {adminNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} className={cn(
                      "h-12 rounded-xl transition-all font-bold px-4",
                      isActive ? "bg-primary text-zinc-900 shadow-lg shadow-primary/20" : "hover:bg-white/5 text-zinc-400 hover:text-white"
                    )}>
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className={cn("w-5 h-5", isActive ? "text-zinc-900" : "text-zinc-500")} />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        {isActive && <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-data-[collapsible=icon]:hidden" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              <SidebarMenuItem className="mt-4 border-t border-white/5 pt-4">
                <SidebarMenuButton asChild className="h-12 rounded-xl transition-all font-bold px-4 hover:bg-white/5 text-zinc-400 hover:text-white">
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-zinc-500" />
                    <span className="group-data-[collapsible=icon]:hidden">Learner Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="bg-white/5 rounded-3xl p-4 border border-white/10 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-0">
              <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:mb-0">
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarImage src={`https://picsum.photos/seed/${profile.id}/100`} />
                  <AvatarFallback className="font-black text-xs bg-zinc-800">{(profile.name || 'A')[0]}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
                  <p className="text-xs font-black truncate text-white">{profile.name}</p>
                  <p className="text-[8px] font-black uppercase text-primary tracking-widest leading-none">ROOT ADMIN</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                className="w-full h-10 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm group-data-[collapsible=icon]:hidden"
                onClick={() => signOut(auth)}
              >
                <LogOut className="w-3 h-3 mr-2" /> EXIT
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col bg-transparent relative">
          <header className="h-16 flex items-center px-4 md:px-8 sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-30 justify-between border-b border-muted">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-zinc-900 h-10 w-10 hover:bg-muted rounded-xl" />
              <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-muted text-[9px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                <ShieldAlert className="w-3 h-3 text-red-500" /> Security: L0 Access
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">System Clock</p>
                 <p className="text-xs font-black">{time || '--:--:--'}</p>
               </div>
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(86,201,29,0.5)]" />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden scrollbar-hide pb-safe">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
