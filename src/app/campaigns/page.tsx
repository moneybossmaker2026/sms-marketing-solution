"use client";

import { useEffect, useState } from "react";
import CampaignBuilder from "./CampaignBuilder";
import SequenceTracker from "./SequenceTracker";
import { Rocket, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  const [lists, setLists] = useState([]);
  const [smsPrice, setSmsPrice] = useState(0.07);
  const [activeTab, setActiveTab] = useState<"CREATE" | "TRACKER">("CREATE");

  useEffect(() => {
    fetch('/api/user/lists').then(res => res.json()).then(data => setLists(data)).catch(() => {});
    fetch('/api/user/config').then(res => res.json()).then(data => setSmsPrice(data.smsPrice)).catch(() => {});
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Campaign Studio</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Design messaging sequences and monitor deployment metrics.
        </p>
      </div>

      <div className="flex border-b border-border">
        <button onClick={() => setActiveTab("CREATE")} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "CREATE" ? "border-[#00D2FF] text-[#00D2FF]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Rocket className="w-4 h-4" /> Build & Launch
        </button>
        <button onClick={() => setActiveTab("TRACKER")} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "TRACKER" ? "border-[#A229C5] text-[#A229C5]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          <Activity className="w-4 h-4" /> Deployment Tracker
        </button>
      </div>

      <div className="pt-4">
        {activeTab === "CREATE" ? (
          <CampaignBuilder lists={lists} smsPrice={smsPrice} onLaunch={() => setActiveTab("TRACKER")} />
        ) : (
          <SequenceTracker />
        )}
      </div>
    </div>
  );
}