"use client";

import React, { useEffect, useState } from "react";
import { getCampaignStatuses } from "./tracker-actions";
import { Activity, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Sequence = Awaited<ReturnType<typeof getCampaignStatuses>>[0];

export default function SequenceTracker() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    const data = await getCampaignStatuses();
    setSequences(data);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchData();

    const handleLaunchEvent = () => fetchData();
    window.addEventListener("sequence_launched", handleLaunchEvent);

    const interval = setInterval(() => {
      setSequences((curr) => {
        if (curr.some(s => s.status === "PROCESSING")) {
          fetchData();
        }
        return curr;
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sequence_launched", handleLaunchEvent);
    };
  }, []);

  return (
    <Card className="shadow-sm border-border bg-card">
      <div className="p-4 border-b border-border flex justify-between items-center bg-accent/10">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Activity className="w-4 h-4 text-[#A229C5]" /> Delivery Logs
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isRefreshing} className="h-8">
          <RefreshCw className={`w-3 h-3 mr-2 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent bg-accent/30">
              <TableHead className="h-11 px-6 font-medium text-foreground">Campaign Identity</TableHead>
              <TableHead className="h-11 font-medium text-foreground">Network Status</TableHead>
              <TableHead className="h-11 w-1/3 font-medium text-foreground">Distribution Progress</TableHead>
              <TableHead className="h-11 px-6 text-right font-medium text-foreground">Payloads Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sequences.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12 text-sm">
                  System awaiting deployment orders. No history found.
                </TableCell>
              </TableRow>
            )}
            {sequences.map((seq) => (
              <React.Fragment key={seq.id}>
                <TableRow
                  className="border-border hover:bg-accent/50 cursor-pointer group transition-colors"
                  onClick={() => setExpandedId(expandedId === seq.id ? null : seq.id)}
                >
                  <TableCell className="font-semibold flex items-center gap-2 px-6 text-foreground">
                    {expandedId === seq.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-[#00D2FF] transition-colors" />}
                    {seq.name}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase border ${
                      seq.status === 'COMPLETED' ? 'bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/30' : 
                      seq.status === 'FAILED_INSUFFICIENT_FUNDS' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                      seq.status === 'PROCESSING' ? 'bg-accent text-foreground border-border animate-pulse' : 
                      'bg-accent text-muted-foreground border-border'
                    }`}>
                      {seq.status.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-full flex items-center gap-3">
                      <div className="flex-1 h-2 bg-background border border-border rounded-full overflow-hidden">
                         <div
                           className={`h-full ${seq.status === 'COMPLETED' ? 'bg-gradient-to-r from-[#00D2FF] to-[#A229C5]' : seq.status === 'FAILED_INSUFFICIENT_FUNDS' ? 'bg-destructive' : 'bg-[#00D2FF]/80'} transition-all duration-500`}
                           style={{ width: `${seq.progress}%` }}
                         />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground min-w-[35px] text-right">{seq.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground text-sm px-6">
                    <span className="text-foreground">{seq.completedLogs}</span> / {seq.totalTargets}
                  </TableCell>
                </TableRow>

                {expandedId === seq.id && (
                  <TableRow className="bg-accent/10 border-b border-border shadow-inner">
                    <TableCell colSpan={4} className="p-0">
                      <div className="px-6 py-5 flex gap-8 text-sm text-muted-foreground">
                        <div className="w-12 flex flex-col items-center justify-start pt-1 border-r border-border pr-8">
                          {seq.status === 'COMPLETED' ? (
                            <CheckCircle2 className="w-6 h-6 text-[#A229C5]" />
                          ) : seq.status === 'FAILED_INSUFFICIENT_FUNDS' ? (
                            <AlertCircle className="w-6 h-6 text-destructive" />
                          ) : (
                            <Activity className="w-6 h-6 text-[#00D2FF] animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-5 gap-4 items-center">
                            <span className="font-semibold uppercase text-[11px] tracking-wider">Target Node:</span>
                            <span className="col-span-4 text-foreground font-medium">{seq.listName}</span>
                          </div>
                          <div className="grid grid-cols-5 gap-4 items-start">
                            <span className="font-semibold uppercase text-[11px] tracking-wider mt-2">Payload Data:</span>
                            <div className="col-span-4 text-foreground bg-background border border-border p-3 rounded-lg shadow-sm whitespace-pre-wrap word-break font-mono text-[13px] leading-relaxed">
                              {seq.messageBody}
                            </div>
                          </div>
                          <div className="grid grid-cols-5 gap-4 items-center">
                            <span className="font-semibold uppercase text-[11px] tracking-wider">Diagnostics:</span>
                            <span className="col-span-4 text-foreground text-[13px]">
                              {seq.status === 'PROCESSING' ? 'Establishing network handshake and injecting payload...' : seq.status === 'FAILED_INSUFFICIENT_FUNDS' ? 'Deployment halted. Insufficient network credits.' : 'Deployment sequence terminated successfully.'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}