
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, orderBy, limit, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMemoFirebase } from "@/firebase/provider";
import { Search, Filter, Trash2, ShieldBan, RefreshCw, UserCheck, MoreVertical, Star, Flame, Award, ShieldAlert, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserManagementPage() {
  const { profile: adminProfile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => {
    if (!adminProfile?.isAdmin) return null;
    return query(collection(firestore, "users"), orderBy("xp", "desc"));
  }, [adminProfile, firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  const filteredUsers = users?.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const logAction = async (action: string, details: string) => {
    await addDoc(collection(firestore, "admin_logs"), {
      action,
      details,
      adminId: adminProfile?.id,
      adminName: adminProfile?.name,
      timestamp: serverTimestamp()
    });
  };

  const toggleBlockStatus = async (user: any) => {
    setIsProcessing(user.id);
    try {
      const userRef = doc(firestore, "users", user.id);
      const newStatus = !user.isBlocked;
      await updateDoc(userRef, { isBlocked: newStatus });
      await logAction(newStatus ? "BLOCK_USER" : "UNBLOCK_USER", `User: ${user.name} (${user.id})`);
      toast({ title: `User ${newStatus ? 'Blocked' : 'Unblocked'}` });
    } catch (err) {
      toast({ title: "Operation Failed", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  const resetProgress = async (user: any) => {
    if (!confirm(`Are you sure you want to reset all progress for ${user.name}? This is irreversible.`)) return;
    setIsProcessing(user.id);
    try {
      const userRef = doc(firestore, "users", user.id);
      await updateDoc(userRef, { xp: 0, streak: 0, learnedWords: [], level: "Beginner" });
      await logAction("RESET_USER", `User: ${user.name} (${user.id})`);
      toast({ title: "Progress Reset Successfully" });
    } catch (err) {
      toast({ title: "Operation Failed", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  const deleteUser = async (user: any) => {
    if (!confirm(`Permanently delete ${user.name}'s account? This action is absolute.`)) return;
    setIsProcessing(user.id);
    try {
      await deleteDoc(doc(firestore, "users", user.id));
      await logAction("DELETE_USER", `User: ${user.name} (${user.id})`);
      toast({ title: "User Purged" });
    } catch (err) {
      toast({ title: "Deletion Failed", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-safe">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Scholar Directory</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage network nodes</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search scholars..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-2 border-muted focus-visible:ring-primary shadow-sm font-bold"
          />
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-muted/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Accessing Node Database...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="bg-[#f8fafc]">
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14 pl-8">Scholar</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14">Status</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14">Proficiency</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14">Last Active</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14 text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id} className={cn(
                      "hover:bg-muted/30 transition-colors border-b last:border-0",
                      user.isBlocked && "opacity-60 bg-red-50/20"
                    )}>
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-muted">
                            <AvatarImage src={`https://picsum.photos/seed/${user.id}/100`} />
                            <AvatarFallback className="font-black text-xs">{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="max-w-[150px]">
                            <p className="font-black text-sm truncate italic">{user.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <span className="flex items-center gap-1.5 text-red-600 font-black text-[10px] uppercase tracking-widest">
                            <ShieldBan className="w-3 h-3" /> Blocked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-primary font-black text-[10px] uppercase tracking-widest">
                            <UserCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-blue-500 fill-blue-500" />
                            <span className="text-xs font-black">{user.xp.toLocaleString()}</span>
                          </div>
                          <div className="px-2 py-0.5 bg-muted rounded-full text-[8px] font-black uppercase tracking-tighter">{user.level}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-black text-muted-foreground whitespace-nowrap">
                          {user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-muted" disabled={isProcessing === user.id}>
                              {isProcessing === user.id ? <Loader2 className="animate-spin w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-2xl bg-white border-b-4 border-muted">
                            <DropdownMenuItem onClick={() => toggleBlockStatus(user)} className="rounded-xl h-11 cursor-pointer font-bold">
                              {user.isBlocked ? <><UserCheck className="mr-2 w-4 h-4 text-primary" /> Unblock</> : <><ShieldBan className="mr-2 w-4 h-4 text-red-500" /> Block Scholar</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => resetProgress(user)} className="rounded-xl h-11 cursor-pointer font-bold">
                              <RefreshCw className="mr-2 w-4 h-4 text-orange-500" /> Reset Stats
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteUser(user)} className="rounded-xl h-11 cursor-pointer font-bold text-red-600">
                              <Trash2 className="mr-2 w-4 h-4" /> Purge Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
