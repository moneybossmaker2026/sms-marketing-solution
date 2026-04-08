"use client";

import { useState } from "react";
import { updateUser } from "./actions";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";

type User = {
  id: string;
  username: string;
  role: string;
  balance: number;
};

export default function EditUserModal({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("userId", user.id);

    try {
      await updateUser(formData);
      toast.success("User updated successfully.");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
          <Edit className="w-3 h-3 mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit User: {user.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New Password (Leave blank to keep current)</Label>
            <Input name="password" type="password" placeholder="••••••••" className="bg-background focus-visible:ring-[#A229C5]" />
          </div>
          <div className="space-y-2">
            <Label>Account Role</Label>
            <Select name="role" defaultValue={user.role}>
              <SelectTrigger className="bg-background focus-visible:ring-[#A229C5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Client (User)</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Exact Wallet Balance ($)</Label>
            <Input name="balance" type="number" step="0.01" min="0" defaultValue={user.balance} required className="bg-background focus-visible:ring-[#A229C5]" />
            <p className="text-[11px] text-muted-foreground">This will overwrite the user's current balance completely.</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}