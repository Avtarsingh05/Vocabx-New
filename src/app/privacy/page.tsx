"use client";

import { useState, useEffect } from "react";
import { 
  ChevronUp, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  Cpu, 
  UserMinus, 
  Share2, 
  Cookie, 
  Mail, 
  ArrowLeft,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * VocabX Privacy Policy Page
 * A transparent, trustworthy legal document component for mobile and desktop.
 */
export default function PrivacyPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-xl border-b border-muted z-50 flex items-center px-4 md:px-8">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center rotate-6 shadow-lg hover:rotate-0 transition-transform">
              <span className="text-sm font-black text-white italic">X</span>
            </Link>
            <h1 className="text-sm font-black tracking-tight uppercase italic">Privacy Policy</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 text-[10px] font-black uppercase tracking-widest bg-muted/50">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-24 space-y-12 animate-in fade-in duration-700">
        {/* Intro Section */}
        <section className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-2 rotate-3 border border-primary/20 shadow-xl">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tighter italic uppercase">Privacy Shield</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Last Updated: October 2023</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border-b-8 border-muted shadow-sm text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium leading-relaxed text-zinc-700">
                At <span className="font-black italic">VocabX</span>, your privacy is our highest protocol. We are committed to transparency regarding how we collect, use, and safeguard your linguistic evolution data.
              </p>
            </div>
          </div>
        </section>

        {/* Policy Sections */}
        <div className="space-y-8">
          <PrivacySection 
            icon={<Eye className="w-5 h-5" />}
            title="1. Information We Collect"
            points={[
              "Identity: Name and email address provided during authentication.",
              "Progress: Vocabulary words learned, test scores, and streak data.",
              "Telemetry: Basic app usage patterns to optimize performance.",
              "No sensitive financial or personal data is collected."
            ]}
          />

          <PrivacySection 
            icon={<Database className="w-5 h-5" />}
            title="2. How We Use Data"
            points={[
              "To personalize your learning path and adjust difficulty levels.",
              "To maintain your global ranking in the Hall of Fame.",
              "To notify you of critical system updates or streak risks.",
              "To improve our AI generation algorithms for better accuracy."
            ]}
          />

          <PrivacySection 
            icon={<Cpu className="w-5 h-5" />}
            title="3. AI Processing"
            points={[
              "Linguistic data is processed via the Google Gemini API.",
              "AI processing is focused purely on vocabulary generation and grading.",
              "Personal identifiers are anonymized before being processed by AI nodes.",
              "No personal data is used to train third-party AI models."
            ]}
          />

          <PrivacySection 
            icon={<ShieldCheck className="w-5 h-5" />}
            title="4. Data Storage & Sharing"
            points={[
              "All data is stored securely using Google Firebase Cloud infrastructure.",
              "We NEVER sell user data to advertisers or third parties.",
              "Data is shared only with necessary service providers (e.g., Auth, Database).",
              "Access to administrative logs is strictly restricted to L0 clearance."
            ]}
          />

          <PrivacySection 
            icon={<UserMinus className="w-5 h-5" />}
            title="5. Your Rights"
            points={[
              "You can request a full purge of your account data at any time.",
              "You have the right to export your learning history.",
              "You can opt-out of optional telemetry tracking.",
              "You may stop using the platform and archive your node indefinitely."
            ]}
          />

          <PrivacySection 
            icon={<Cookie className="w-5 h-5" />}
            title="6. Cookies & Tracking"
            points={[
              "We use basic session cookies to maintain your login status.",
              "Analytics nodes track anonymized feature interaction.",
              "No cross-site tracking or invasive behavioral profiling is utilized."
            ]}
          />
        </div>

        {/* Contact Footer */}
        <footer className="bg-zinc-900 text-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden border-b-[10px] border-primary/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/15 rounded-full blur-[60px] -mr-20 -mt-20" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tighter leading-none">Privacy Terminal</h2>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mt-1">Data Protection Office</p>
              </div>
            </div>
            <p className="text-sm font-medium text-white/70 leading-relaxed max-w-md">
              Have questions about your data node? Dispatch a signal to our privacy officers for immediate clarification.
            </p>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-primary">Email:</span>
              <a href="mailto:forigloohelp@gmail.com" className="text-sm font-bold hover:text-primary transition-colors">forigloohelp@gmail.com</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-24 right-6 w-12 h-12 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-90 z-50 border-b-4 border-primary-foreground/20",
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <ChevronUp className="w-6 h-6 stroke-[3px]" />
      </button>
    </div>
  );
}

function PrivacySection({ icon, title, points }: { icon: React.ReactNode, title: string, points: string[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white border-2 border-muted rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
          {icon}
        </div>
        <h3 className="text-lg font-black italic tracking-tight text-zinc-900">{title}</h3>
      </div>
      <div className="bg-white rounded-[1.5rem] p-6 border border-muted/50 shadow-sm">
        <ul className="space-y-3">
          {points.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <p className="text-sm font-medium text-zinc-600 leading-relaxed">{point}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
