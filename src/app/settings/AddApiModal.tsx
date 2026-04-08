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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await createSmsApi(formData);
      toast.success("Gateway established successfully.");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to inject API gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-background text-foreground border border-border hover:bg-accent hover:text-foreground">
          <Activity className="w-4 h-4 mr-2 text-[#A229C5]" /> Inject Gateway
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add New SMS API Node</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Internal Identity</Label>
            <Input name="name" required placeholder="e.g. Twilio Route 1" className="bg-background focus-visible:ring-[#A229C5]" />
          </div>
          <div className="space-y-2">
            <Label>API Endpoint URL</Label>
            <Input name="url" required placeholder="https://api..." className="bg-background focus-visible:ring-[#A229C5]" />
          </div>
          <div className="space-y-2">
            <Label>Headers (JSON)</Label>
            <textarea name="headers" required defaultValue='{"Authorization": "Bearer KEY"}' className="w-full h-20 p-3 rounded-md bg-background border border-input text-[13px] focus:ring-2 focus:ring-[#A229C5] outline-none font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Payload (JSON)</Label>
            <textarea name="payload" required defaultValue='{"to": "{{phone}}", "text": "{{message}}"}' className="w-full h-24 p-3 rounded-md bg-background border border-input text-[13px] focus:ring-2 focus:ring-[#A229C5] outline-none font-mono" />
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white font-bold">
            {loading ? "Establishing..." : "Establish Connection"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}