"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Calculator, Smartphone, FileText } from "lucide-react";
import { createDraftCampaign } from "./actions";

type List = { id: string; name: string; _count: { Contacts: number } };
type Template = { id: string; name: string; content: string };

export default function CampaignBuilder({ lists, templates, smsPrice, onLaunch }: { lists: List[], templates: Template[], smsPrice: number, onLaunch: () => void }) {
  const[loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const[senderId, setSenderId] = useState("");
  const [message, setMessage] = useState("Hi {{firstName}}, we have an exclusive offer waiting for you!");
  const [selectedList, setSelectedList] = useState("");
  const[selectedTemplate, setSelectedTemplate] = useState("none");

  const selectedListData = lists.find(l => l.id === selectedList);
  const audienceSize = selectedListData?._count.Contacts || 0;
  const estimatedCost = (audienceSize * smsPrice).toFixed(2);

  let livePreview = message;
  livePreview = livePreview.replace(/{{firstName}}/g, "John");
  livePreview = livePreview.replace(/{{lastName}}/g, "Doe");

  const handleTemplateChange = (val: string) => {
    setSelectedTemplate(val);
    if (val !== "none") {
      const t = templates.find(t => t.id === val);
      if (t) setMessage(t.content);
    }
  };

  const handleLaunch = async () => {
    if (!name || !message || !selectedList) {
      return toast.error("Please complete all required fields.");
    }

    setLoading(true);
    try {
      const campaignId = await createDraftCampaign(name, selectedList, message, senderId);

      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, listId: selectedList, messageBody: message })
      });

      if (!res.ok) throw new Error("Dispatch failed");

      toast.success("Campaign launched successfully.");
      setName("");
      setSenderId("");
      setMessage("Hi {{firstName}}, we have an exclusive offer waiting for you!");
      setSelectedTemplate("none");
      onLaunch();
      window.dispatchEvent(new Event("sequence_launched"));
    } catch (error) {
      toast.error("Failed to launch campaign. Please check your balance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: Input Form & Cost Analysis */}
      <Card className="shadow-sm border-border bg-card">
        <CardContent className="space-y-6 pt-6 flex flex-col h-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">1. Campaign Name</Label>
              <Input placeholder="e.g. Q4 Promo" value={name} onChange={(e) => setName(e.target.value)} className="bg-background h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">2. Choose Audience</Label>
              <Select value={selectedList} onValueChange={setSelectedList}>
                {/* FIX: Forced w-full and !h-11 to override any Shadcn defaults so it matches Input perfectly */}
                <SelectTrigger className="w-full !h-11 bg-background">
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent>
                  {lists.length === 0 && <SelectItem value="none" disabled>No lists available</SelectItem>}
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name} <span className="text-muted-foreground ml-2">({list._count.Contacts})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-semibold">3. Sender ID (SID)</Label>
            <Input placeholder="Optional: e.g. UTOPIA" value={senderId} onChange={(e) => setSenderId(e.target.value)} maxLength={11} className="bg-background h-11" />
            <p className="text-[10px] text-muted-foreground">The name that appears at the top of the text message (Max 11 characters).</p>
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <Label className="text-foreground font-semibold">4. Message Content</Label>

              {/* NEW: Template Selector inside Campaign Builder */}
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="h-8 px-3 text-xs bg-accent/50 border-border w-[180px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    <SelectValue placeholder="Use Template..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Manual Entry</SelectItem>
                  {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-1 mb-2">
              <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded uppercase tracking-wider bg-background">{"{{firstName}}"}</span>
              <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded uppercase tracking-wider bg-background">{"{{lastName}}"}</span>
            </div>

            <textarea
              placeholder="Type your message here..."
              className="w-full flex-1 min-h-[120px] p-4 rounded-lg bg-background border border-input text-sm focus:ring-2 focus:ring-[#00D2FF] outline-none resize-none transition-all leading-relaxed"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Cost Analysis Projection */}
          {selectedList && (
            <div className="p-4 rounded-lg border border-[#00D2FF]/30 bg-[#00D2FF]/5 mt-auto">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3 text-foreground">
                <Calculator className="w-4 h-4 text-[#00D2FF]" /> Cost Analysis Projection
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Detected Audience Size:</span>
                  <span className="font-semibold text-foreground">{audienceSize.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Network Rate per SMS:</span>
                  <span className="font-semibold text-foreground">${smsPrice}</span>
                </div>
                <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-border/50">
                  <span>Required Wallet Balance:</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#A229C5]">
                    ${estimatedCost}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleLaunch} disabled={loading} className="w-full h-12 text-base bg-gradient-to-r from-[#00D2FF] to-[#A229C5] hover:opacity-90 border-0 text-white font-bold shadow-lg transition-all rounded-lg mt-2">
            {loading ? "Initializing Deployment..." : <><Rocket className="w-5 h-5 mr-2" /> Launch Sequence</>}
          </Button>
        </CardContent>
      </Card>

      {/* Right: Phone Preview Only */}
      <div className="space-y-6">
        <Card className="shadow-sm border-border bg-card overflow-hidden h-full">
          <div className="bg-accent/40 p-3 border-b border-border flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Delivery Preview</span>
          </div>
          <CardContent className="p-8 flex justify-center items-center bg-dot-pattern bg-[length:14px_14px] h-[calc(100%-45px)]">
            <div className="w-[300px] h-[580px] border-[12px] border-[#1e1e1e] rounded-[45px] relative overflow-hidden bg-white shadow-2xl flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[25px] bg-[#1e1e1e] rounded-b-[18px] z-10 flex justify-center items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black border border-[#333]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#111]"></div>
              </div>

              <div className="bg-gray-100/90 backdrop-blur-md pt-10 pb-3 px-4 border-b border-gray-200 flex items-center justify-center z-0">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold mb-1">
                    {senderId ? senderId.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-semibold text-black">{senderId || "Utopia Sender"}</span>
                </div>
              </div>

              <div className="flex-1 bg-white p-4 overflow-y-auto flex flex-col gap-3">
                <span className="text-[10px] text-gray-400 text-center block mb-2 font-medium">Today 10:41 AM</span>
                <div className="bg-blue-500 text-white px-4 py-2.5 rounded-2xl rounded-br-sm self-end max-w-[85%] text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap word-break">
                  {livePreview || "..."}
                </div>
              </div>

              <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
                <div className="flex-1 bg-white border border-gray-300 rounded-full h-8 px-3 text-[11px] text-gray-400 flex items-center">
                  Text Message
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}