"use client";

import { useState } from "react";
import { addSingleContact, updateContact, removeContactFromList } from "../actions";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Pencil, Trash2, Ban } from "lucide-react";

type Contact = { id: string; phone: string; firstName: string | null; lastName: string | null; isOptOut: boolean; };

export default function ContactManager({ listId, initialContacts }: { listId: string, initialContacts: Contact[] }) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredContacts = initialContacts.filter(c =>
    c.phone.includes(search) ||
    (c.firstName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.lastName?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addSingleContact(listId, formData);
      toast.success("Contact added to list.");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (contactId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await updateContact(contactId, listId, formData);
      toast.success("Contact updated.");
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to update.");
    }
  };

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardContent className="p-0">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-accent/10">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by phone or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background focus-visible:ring-[#00D2FF]"
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white">
                <UserPlus className="w-4 h-4 mr-2" /> Add Single Target
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add Manual Target</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Phone Number (with Country Code)</Label>
                  <Input name="phone" required placeholder="+12345678900" className="bg-background focus-visible:ring-[#00D2FF]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name (Optional)</Label>
                    <Input name="firstName" placeholder="John" className="bg-background focus-visible:ring-[#00D2FF]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name (Optional)</Label>
                    <Input name="lastName" placeholder="Doe" className="bg-background focus-visible:ring-[#00D2FF]" />
                  </div>
                </div>
                <Button type="submit" disabled={adding} className="w-full mt-2">
                  {adding ? "Adding..." : "Save Contact"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent bg-accent/30">
              <TableHead className="h-11 px-6 font-medium text-foreground">Phone</TableHead>
              <TableHead className="h-11 font-medium text-foreground">First Name</TableHead>
              <TableHead className="h-11 font-medium text-foreground">Last Name</TableHead>
              <TableHead className="h-11 text-center font-medium text-foreground">Status</TableHead>
              <TableHead className="h-11 px-6 text-right font-medium text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                  No contacts found in this list.
                </TableCell>
              </TableRow>
            )}
            {filteredContacts.map(c => (
              <TableRow key={c.id} className="border-border hover:bg-accent/50 transition-colors">
                <TableCell className="px-6 font-medium font-mono text-sm">{c.phone}</TableCell>
                <TableCell className="text-muted-foreground">{c.firstName || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{c.lastName || "-"}</TableCell>
                <TableCell className="text-center">
                  {c.isOptOut ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-destructive/10 text-destructive border border-destructive/20">
                      <Ban className="w-3 h-3" /> Opted Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Active
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right px-6 space-x-2">
                  <Dialog open={editingId === c.id} onOpenChange={(open) => !open && setEditingId(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(c.id)} className="h-8 w-8 text-muted-foreground hover:text-[#00D2FF]">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader><DialogTitle>Edit Contact Data</DialogTitle></DialogHeader>
                      <form onSubmit={(e) => handleEdit(c.id, e)} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input value={c.phone} disabled className="bg-accent/50 opacity-70" />
                          <p className="text-[10px] text-muted-foreground">Phone number cannot be changed. Delete and re-add if needed.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input name="firstName" defaultValue={c.firstName || ""} className="bg-background focus-visible:ring-[#00D2FF]" />
                          </div>
                          <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input name="lastName" defaultValue={c.lastName || ""} className="bg-background focus-visible:ring-[#00D2FF]" />
                          </div>
                        </div>
                        <Button type="submit" className="w-full mt-2">Save Changes</Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <form action={removeContactFromList.bind(null, listId, c.id)} className="inline-block">
                    <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}