"use client";

import { useState } from "react";
import { createSmsApi } from "./actions";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";

export default function AddApiModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const[gatewayType, setGatewayType] = useState<"GENERIC" | "EJOIN">("GENERIC");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    if (gatewayType === "EJOIN") {
      const ejoinPayload = {
        isEjoin: true,
        account: formData.get("ejoinAccount"),
        password: formData.get("ejoinPassword")
      };
      formData.set("headers", "{}");
      formData.set("payload", JSON.stringify(ejoinPayload));
    }

    try {
      await createSmsApi(formData);
      toast.success("Gateway connected successfully.");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to connect gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-background text-foreground border border-border hover:bg-accent hover:text-foreground">
          <Activity className="w-4 h-4 mr-2 text-[#A229C5]" /> Connect Gateway
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Connect New SMS Gateway</DialogTitle>
        </DialogHeader>

        <div className="flex bg-accent/50 p-1 rounded-lg border border-border mt-4">
          <button onClick={() => setGatewayType("GENERIC")} className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${gatewayType === "GENERIC" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
            Custom HTTP API
          </button>
          <button onClick={() => setGatewayType("EJOIN")} className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${gatewayType === "EJOIN" ? "bg-gradient-to-r from-[#00D2FF] to-[#A229C5] shadow-sm text-white" : "text-muted-foreground"}`}>
            EJOIN Equipment
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Provider Name</Label>
            <Input name="name" required placeholder={gatewayType === "EJOIN" ? "e.g. My EJOIN Device 1" : "e.g. Twilio"} className="bg-background focus-visible:ring-[#A229C5]" />
          </div>

          {gatewayType === "GENERIC" ? (
            <>
              <div className="space-y-2">
                <Label>API Endpoint URL</Label>
                <Input name="url" required placeholder="https://api..." className="bg-background focus-visible:ring-[#A229C5]" />
              </div>
              <div className="space-y-2">
                <Label>Headers (JSON)</Label>
                <textarea name="headers" required defaultValue='{"Authorization": "Bearer KEY"}' className="w-full h-20 p-3 rounded-md bg-background border border-input text-[13px] focus:ring-2 focus:ring-[#A229C5] outline-none font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Payload Format (JSON)</Label>
                <textarea name="payload" required defaultValue='{"to":["{{phone_no_plus}}"], "text": "{{message}}"}' className="w-full h-24 p-3 rounded-md bg-background border border-input text-[13px] focus:ring-2 focus:ring-[#A229C5] outline-none font-mono" />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Variables: <code className="text-foreground">{"{{phone}}"}</code> (+123), <code className="text-foreground">{"{{phone_no_plus}}"}</code> (123), <code className="text-foreground">{"{{phone_00}}"}</code> (00123), <code className="text-foreground">{"{{message}}"}</code>, <code className="text-foreground">{"{{senderId}}"}</code>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>EJOIN Device IP / URL</Label>
                <Input name="url" required placeholder="http://192.168.1.100:20003" className="bg-background focus-visible:ring-[#00D2FF]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>EJOIN Account</Label>
                  <Input name="ejoinAccount" required placeholder="admin" className="bg-background focus-visible:ring-[#00D2FF]" />
                </div>
                <div className="space-y-2">
                  <Label>EJOIN Password</Label>
                  <Input name="ejoinPassword" type="password" required placeholder="••••••" className="bg-background focus-visible:ring-[#00D2FF]" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground bg-accent/30 p-2 rounded border border-border">
                The system will automatically use high-speed EJOIN Native Batching (smsarray) to dispatch messages to this equipment.
              </p>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white font-bold">
            {loading ? "Connecting..." : "Save Gateway"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}