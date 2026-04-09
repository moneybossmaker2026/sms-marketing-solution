"use client";

import { useState } from "react";
import { updateSmsApi } from "./actions";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";

type ApiType = { id: string, name: string, url: string, headers: string, payload: string };

export default function EditApiModal({ api }: { api: ApiType }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await updateSmsApi(formData);
      toast.success("Gateway updated successfully.");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-[#A229C5] hover:bg-[#A229C5]/10">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit Gateway: {api.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <input type="hidden" name="id" value={api.id} />
          <div className="space-y-2">
            <Label>Internal Identity</Label>
            <Input name="name" defaultValue={api.name} required className="bg-background focus-visible:ring-[#A229C5]" />
          </div>
          <div className="space-y-2">
            <Label>API Endpoint URL</Label>
            <Input name="url" defaultValue={api.url} required className="bg-background focus-visible:ring-[#A229C5]" />
          </div>
          <div className="space-y-2">
            <Label>Headers (JSON)</Label>
            <textarea name="headers" defaultValue={api.headers} required className="w-full h-20 p-3 rounded-md bg-background border border-input text-[13px] focus:ring-2 focus:ring-[#A229C5] outline-none font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Payload (JSON)</Label>
            <textarea name="payload" defaultValue={api.payload} required className="w-full h-24 p-3 rounded-md bg-background border border-input text-[13px] focus:ring-2 focus:ring-[#A229C5] outline-none font-mono" />
            <p className="text-[11px] text-muted-foreground mt-1">
              Variables: <code className="text-foreground">{"{{phone}}"}</code> (+123), <code className="text-foreground">{"{{phone_no_plus}}"}</code> (123), <code className="text-foreground">{"{{phone_00}}"}</code> (00123), <code className="text-foreground">{"{{message}}"}</code>
            </p>
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white font-bold">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}