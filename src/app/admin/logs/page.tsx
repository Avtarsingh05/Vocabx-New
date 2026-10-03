
"use client";

import { useAuth } from "@/hooks/use-auth";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMemoFirebase } from "@/firebase/provider";
import { History, Shield, Clock, Activity, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function AdminLogsPage() {
  const { profile } = useAuth();
  
  const logsQuery = useMemoFirebase(() => {
    // Only initiate the query if the user is confirmed as an admin to prevent permission errors
    if (!profile?.isAdmin) return null;
    return query(collection(db, "admin_logs"), orderBy("timestamp", "desc"), limit(100));
  }, [profile]);

  const { data: logs, isLoading } = useCollection(logsQuery);

  if (!profile?.isAdmin) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-safe">
      <header>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
          <History className="w-8 h-8 text-primary" /> Audit Trail
        </h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">L0 Administrative Record</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-muted/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Accessing Logs...</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="bg-[#f8fafc]">
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14 pl-8">Timestamp</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14">Guardian</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14">Action</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14">Details</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest h-14 text-right pr-8">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors border-b last:border-0">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">
                            {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : 'Syncing...'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-black italic">{log.adminName}</span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                          log.action?.includes("DELETE") ? "bg-red-100 text-red-600" :
                          log.action?.includes("UPDATE") ? "bg-blue-100 text-blue-600" :
                          "bg-zinc-100 text-zinc-600"
                        )}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-bold opacity-70 truncate max-w-[200px]">{log.details}</p>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <span className="flex items-center justify-end gap-1.5 text-primary font-black text-[9px] uppercase">
                           VERIFIED <Shield className="w-3 h-3 fill-primary" />
                        </span>
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
