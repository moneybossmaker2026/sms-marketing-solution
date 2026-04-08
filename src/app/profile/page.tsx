"use client";

import { useState } from "react";
import { updatePassword } from "./actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await updatePassword(formData);
      toast.success("Password updated successfully.");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto mt-10">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">My Profile</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account security and password.
        </p>
      </div>

      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            Security Settings
          </CardTitle>
          <CardDescription>Update your password here to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input name="currentPassword" type="password" required className="bg-background focus-visible:ring-[#00D2FF]" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input name="newPassword" type="password" minLength={6} required className="bg-background focus-visible:ring-[#00D2FF]" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input name="confirmPassword" type="password" minLength={6} required className="bg-background focus-visible:ring-[#00D2FF]" />
            </div>
            <Button disabled={loading} type="submit" className="w-full h-10 mt-4 bg-gradient-to-r from-[#00D2FF] to-[#A229C5] hover:opacity-90 border-0 text-white font-medium shadow-md">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}