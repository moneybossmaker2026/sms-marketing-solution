"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

export default function ApiLogsModal({ apiName, lastError }: { apiName: string, lastError: string | null }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs px-2 border-destructive/30 text-destructive hover:bg-destructive/10">
          <Terminal className="w-3 h-3 mr-1" /> View Logs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1e1e1e] border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-gray-200">Failure Logs: {apiName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 p-4 bg-black rounded-lg border border-[#333] font-mono text-xs text-red-400 whitespace-pre-wrap overflow-auto max-h-[300px]">
          {lastError || "No errors recorded. System healthy."}
        </div>
      </DialogContent>
    </Dialog>
  );
}