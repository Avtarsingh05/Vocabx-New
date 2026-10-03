
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, Plus, Image as ImageIcon, Link as LinkIcon, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AdminBannersPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [newBanner, setNewBanner] = useState({
    title: "",
    link: "",
    imageUrl: "",
    active: true
  });

  const fetchBanners = async () => {
    if (!profile?.isAdmin) return;
    setLoading(true);
    try {
      const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || uploadPreset === 'your_unsigned_preset') {
      toast({ 
        title: "Cloudinary Not Configured", 
        description: "Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setNewBanner(prev => ({ ...prev, imageUrl: data.secure_url }));
        toast({ title: "Image Uploaded", description: "Scholarly visual cached in cloud." });
      }
    } catch (err) {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.imageUrl || !newBanner.link) {
      toast({ title: "Protocol Incomplete", description: "Image and Link required.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      await addDoc(collection(db, "banners"), {
        ...newBanner,
        createdAt: serverTimestamp()
      });
      toast({ title: "Banner Deployed", description: "Signal live on main terminal." });
      setNewBanner({ title: "", link: "", imageUrl: "", active: true });
      fetchBanners();
    } catch (err) {
      toast({ title: "Deployment Failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const toggleBanner = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "banners", id), { active: !current });
      fetchBanners();
    } catch (err) {}
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteDoc(doc(db, "banners", id));
      fetchBanners();
      toast({ title: "Banner Purged" });
    } catch (err) {}
  };

  if (profile?.isAdmin !== true) return null;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700 pb-safe">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-3 italic text-zinc-900 uppercase">
             <ImageIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" /> Visual Ad Terminal
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-2 opacity-50">Global Banner Management Node</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Panel */}
        <section className="lg:col-span-1 space-y-6">
           <Card className="rounded-[2rem] p-6 md:p-8 bg-white border-b-8 border-muted shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-muted">
                 <Plus className="w-5 h-5 text-primary" />
                 <h2 className="text-xl font-black italic">DEPLOY NEW SIGNAL</h2>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Internal Title</Label>
                    <Input 
                      placeholder="e.g. Summer Sale 2024"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                      className="h-12 rounded-xl border-2 font-bold"
                    />
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Redirect Link</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://..."
                        value={newBanner.link}
                        onChange={(e) => setNewBanner({...newBanner, link: e.target.value})}
                        className="h-12 pl-12 rounded-xl border-2 font-bold"
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Scholarly Visual</Label>
                    <div className="border-2 border-dashed border-muted rounded-2xl p-4 text-center space-y-3 hover:border-primary transition-colors bg-muted/5">
                       {newBanner.imageUrl ? (
                         <div className="relative aspect-video rounded-xl overflow-hidden shadow-inner">
                            <Image src={newBanner.imageUrl} alt="Preview" fill className="object-cover" />
                            <button onClick={() => setNewBanner({...newBanner, imageUrl: ""})} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full backdrop-blur">
                               <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </div>
                       ) : (
                         <div className="py-4">
                            <input 
                              type="file" 
                              id="banner-up" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                            <label htmlFor="banner-up" className="cursor-pointer space-y-2 block">
                               <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto">
                                  {uploading ? <Loader2 className="animate-spin text-primary" /> : <ImageIcon className="text-muted-foreground" />}
                               </div>
                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Image Asset</p>
                            </label>
                         </div>
                       )}
                    </div>
                 </div>

                 <Button 
                    onClick={handleAddBanner} 
                    disabled={uploading} 
                    className="w-full h-14 lingua-button lingua-button-primary shadow-xl mt-4"
                 >
                    {uploading ? <RefreshCw className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                    ACTIVATE BANNER
                 </Button>
              </div>
           </Card>
        </section>

        {/* List Panel */}
        <section className="lg:col-span-2 space-y-6">
           <div className="flex items-center gap-3 px-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-black italic">ACTIVE SIGNALS</h2>
           </div>

           {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
                <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Accessing Visual Database...</p>
             </div>
           ) : banners.length === 0 ? (
             <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed text-center space-y-3">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No banners deployed.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((b) => (
                  <Card key={b.id} className="rounded-[2.5rem] overflow-hidden bg-white border-b-8 shadow-sm group">
                     <div className="relative aspect-video">
                        <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                        <div className={cn(
                          "absolute top-4 left-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md",
                          b.active ? "bg-green-500 text-white" : "bg-zinc-800 text-zinc-400"
                        )}>
                          {b.active ? "ACTIVE" : "INACTIVE"}
                        </div>
                     </div>
                     <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="text-lg font-black italic text-zinc-900 truncate max-w-[200px]">{b.title || 'Untitled Banner'}</h3>
                              <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-tight mt-1">
                                 <ExternalLink className="w-3 h-3" /> {b.link.length > 30 ? b.link.slice(0, 30) + '...' : b.link}
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => toggleBanner(b.id, b.active)}
                                className="h-9 w-9 rounded-xl hover:bg-muted"
                              >
                                 <RefreshCw className={cn("w-4 h-4", !b.active && "opacity-30")} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteBanner(b.id)}
                                className="h-9 w-9 rounded-xl hover:text-destructive hover:bg-red-50"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </Button>
                           </div>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
           )}
        </section>
      </div>
    </div>
  );
}
