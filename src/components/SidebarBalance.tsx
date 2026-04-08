"use client";

import { useEffect, useState } from "react";
import { Send, Copy } from "lucide-react";
import { toast } from "sonner";

export function SidebarBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [handle, setHandle] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/user/balance");
        const data = await res.json();
        if (data.balance !== undefined) {
          setBalance(data.balance);
          setHandle(data.telegramHandle);
          setUserId(data.userId);
        }
      } catch (e) {}
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyRef = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      toast.success("Support Reference copied to clipboard!");
    }
  };

  const shortRef = userId ? userId.split("-")[0].toUpperCase() : "LOADING";

  return (
    <div className="px-4 mb-4 mt-2">
      <div className="p-4 rounded-lg bg-accent/30 border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00D2FF] to-[#A229C5]" />

        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Balance</p>
          <button
            onClick={handleCopyRef}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors bg-background border border-border px-1.5 py-0.5 rounded"
            title="Copy Reference"
          >
            REF: {shortRef} <Copy className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div>
          <p className="text-2xl font-bold text-foreground mt-0 tracking-tight">
            ${balance.toFixed(2)}
          </p>
        </div>

        <a
          href={`https://t.me/${handle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-gradient-to-r from-[#00D2FF]/10 to-[#A229C5]/10 hover:from-[#00D2FF]/20 hover:to-[#A229C5]/20 border border-[#00D2FF]/20 text-white font-medium text-sm transition-all"
        >
          <Send className="w-3.5 h-3.5" /> Add Funds
        </a>
      </div>
    </div>
  );
}