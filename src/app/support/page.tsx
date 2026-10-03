"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  LifeBuoy,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Support Page - Central Help Desk
 * Contains Email, WhatsApp (exclusive to this page), and Legal links.
 */
export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-32 pt-14">
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
            <h1 className="text-3xl font-black flex items-center gap-2 italic">
              <LifeBuoy className="w-7 h-7 text-primary" /> Support
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Scholar Help Desk</p>
          </div>
        </header>

        {/* Contact Channels */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1">Direct Signals</h2>
          <div className="grid grid-cols-1 gap-3">
            <a 
              href="https://wa.me/919013618694" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="lingua-card bg-white border-green-500/20 p-5 flex items-center justify-between group hover:border-green-500/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shrink-0 shadow-inner">
                    <MessageSquare className="w-6 h-6 fill-green-600/10" />
                  </div>
                  <div>
                    <p className="font-black text-sm leading-none mb-1">WhatsApp Channel</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">+91 9013618694</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>

            <a href="mailto:forigloohelp@gmail.com" className="block">
              <div className="lingua-card bg-white border-primary/20 p-5 flex items-center justify-between group hover:border-primary/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-inner">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm leading-none mb-1">Email Support</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight italic">forigloohelp@gmail.com</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          </div>
        </section>

        {/* Legal Protocols */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1">Legal Protocols</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/privacy" className="block">
              <div className="lingua-card bg-white p-5 space-y-3 text-center border-b-4 hover:scale-[1.02] transition-transform">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mx-auto border border-blue-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="font-black text-[10px] uppercase tracking-widest">Privacy</p>
              </div>
            </Link>
            <Link href="/terms" className="block">
              <div className="lingua-card bg-white p-5 space-y-3 text-center border-b-4 hover:scale-[1.02] transition-transform">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mx-auto border border-orange-100">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="font-black text-[10px] uppercase tracking-widest">Terms</p>
              </div>
            </Link>
          </div>
        </section>

        {/* System ID */}
        <footer className="text-center pt-8 opacity-40">
          <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[8px] font-black uppercase tracking-widest">Version 3.4.0 • Node: Stable</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
