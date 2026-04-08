"use client";

import { useState } from "react";
import { createUser } from "./actions";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";

export default function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await createUser(formData);
      toast.success("Account provisioned successfully.");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#00D2FF] to-[#A229C5] hover:opacity-90 border-0 text-white font-bold shadow-md">
          <UserPlus className="w-4 h-4 mr-2" /> Provision Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input name="username" required placeholder="client_name" className="bg-background focus-visible:ring-[#A229C5]" />
          </div>
          <div className="space-y-2">
            <Label>Initial Password</Label>
            <Input name="password" type="password" required placeholder="••••••••" className="bg-background focus-visible:ring-[#A229C5]" />
          </div>
          <div className="space-y-2">
            <Label>Privilege Level</Label>
            <Select name="role" defaultValue="USER">
              <SelectTrigger className="bg-background focus-visible:ring-[#A229C5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Standard Client</SelectItem>
                <SelectItem value="ADMIN">System Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Starting Balance ($)</Label>
            <Input name="balance" type="number" step="0.01" defaultValue="0.00" required className="bg-background focus-visible:ring-[#A229C5]" />
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2 bg-foreground text-background hover:bg-foreground/90 font-bold">
            {loading ? "Deploying..." : "Deploy Workspace"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}