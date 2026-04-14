"use client";

import { useState } from "react";
import { createTemplate, updateTemplate } from "./actions";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";

export function CreateTemplateModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTemplate(new FormData(e.currentTarget));
      toast.success("Template saved successfully.");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white shadow-md">
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create SMS Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Template Name</Label>
            <Input name="name" required placeholder="e.g. Welcome Promo" className="bg-background focus-visible:ring-[#00D2FF]" />
          </div>
          <div className="space-y-2">
            <Label className="flex justify-between items-center">
              <span>Message Content</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Use {'{{firstName}}'} or {'{{lastName}}'}</span>
            </Label>
            <textarea name="content" required className="w-full h-32 p-3 rounded-md bg-background border border-input text-sm focus:ring-2 focus:ring-[#00D2FF] outline-none resize-none" placeholder="Type your message here..." />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white">
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditTemplateModal({ template }: { template: { id: string, name: string, content: string } }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTemplate(new FormData(e.currentTarget));
      toast.success("Template updated successfully.");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#00D2FF]">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit SMS Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <input type="hidden" name="id" value={template.id} />
          <div className="space-y-2">
            <Label>Template Name</Label>
            <Input name="name" defaultValue={template.name} required className="bg-background focus-visible:ring-[#00D2FF]" />
          </div>
          <div className="space-y-2">
            <Label className="flex justify-between items-center">
              <span>Message Content</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Use {'{{firstName}}'} or {'{{lastName}}'}</span>
            </Label>
            <textarea name="content" defaultValue={template.content} required className="w-full h-32 p-3 rounded-md bg-background border border-input text-sm focus:ring-2 focus:ring-[#00D2FF] outline-none resize-none" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white">
            {loading ? "Saving..." : "Update Template"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}