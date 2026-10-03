"use client";

import { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Loader2, Fingerprint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RootPage() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !authLoading) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (typeof window !== "undefined" && !authLoading && !user) {
      if (!(window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
        } catch (e) {
          console.error("Recaptcha initialization failed", e);
        }
      }
    }
  }, [authLoading, user]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast({ title: "OTP Sent" });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Verification failed",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (user) return null;

  return (
    <div className="h-svh bg-background flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      <div className="mb-6 flex flex-col items-center gap-1 animate-in slide-in-from-top-4 duration-700">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#22c55e] tracking-tighter italic leading-none">Vocab<span className="text-zinc-950">X</span></h1>
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-900/40 mt-2">Lexicon Evolution</p>
        </div>
      </div>

      <div className="w-full max-w-[400px] lingua-card bg-white p-8 md:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-500 shadow-2xl border-b-[10px] border-black/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#22c55e] to-emerald-600" />
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full mb-2 border border-green-100">
            <Fingerprint className="w-4 h-4 text-[#22c55e]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#22c55e]">Secure Node Access</span>
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter text-zinc-900">Welcome Back</h2>
        </header>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-zinc-100 rounded-2xl p-1 mb-6">
            <TabsTrigger value="email" className="rounded-xl font-black text-[11px] tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#22c55e]">EMAIL ACCESS</TabsTrigger>
            <TabsTrigger value="phone" className="rounded-xl font-black text-[11px] tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-500">PHONE SECURE</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-3">
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-1">
                <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-500 ml-2">Identity</Label>
                <Input 
                  type="email" 
                  placeholder="scholar@vocabx.ai" 
                  className="h-14 rounded-2xl border-2 border-zinc-100 text-sm font-bold bg-zinc-50 px-4 focus:border-[#22c55e] focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-500 ml-2">Key</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-14 rounded-2xl border-2 border-zinc-100 text-sm font-bold bg-zinc-50 px-4 focus:border-[#22c55e] focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full lingua-button lingua-button-primary h-16 text-sm mt-4 rounded-2xl shadow-xl hover:translate-y-[-2px]" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "ENTER NETWORK"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone" className="space-y-3">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-500 ml-2">Terminal</Label>
                  <Input 
                    type="tel" 
                    className="h-10 rounded-xl border border-muted text-[11px] font-bold"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full lingua-button lingua-button-primary h-16 text-sm mt-4 rounded-2xl shadow-xl hover:translate-y-[-2px]" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "SEND CODE"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="space-y-1">
                  <Label className="font-black text-[7px] uppercase tracking-widest text-muted-foreground text-center block">Verification Code</Label>
                  <Input 
                    type="text" 
                    className="h-16 rounded-2xl border-2 border-zinc-100 text-2xl font-black text-center tracking-[0.5em] bg-zinc-50 focus:border-[#22c55e] focus:bg-white transition-all"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full lingua-button lingua-button-primary h-16 text-sm mt-4 rounded-2xl shadow-xl hover:translate-y-[-2px]" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "AUTH & ACCESS"}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <footer className="pt-3 border-t border-muted text-center">
          <p className="text-muted-foreground font-bold text-[8px]">
            New Scholar? <Link href="/register" className="text-primary hover:underline font-black">Create ID</Link>
          </p>
        </footer>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}



