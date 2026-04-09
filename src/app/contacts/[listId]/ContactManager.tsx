"use client";

import { useState } from "react";
import { addMultipleContacts, updateContact, removeContactFromList } from "../actions";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Pencil, Trash2, Ban, PlusCircle, Save } from "lucide-react";

type Contact = { id: string; phone: string; firstName: string | null; lastName: string | null; isOptOut: boolean; };

export default function ContactManager({ listId, initialContacts }: { listId: string, initialContacts: Contact[] }) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [targets, setTargets] = useState([{ phone: "", firstName: "", lastName: "" }]);

  const filteredContacts = initialContacts.filter(c =>
    c.phone.includes(search) ||
    (c.firstName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.lastName?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const addRow = () => setTargets([...targets, { phone: "", firstName: "", lastName: "" }]);

  const removeRow = (index: number) => {
    if (targets.length === 1) return;
    setTargets(targets.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: string, value: string) => {
    const newTargets = [...targets];
    (newTargets[index] as any)[field] = value;
    setTargets(newTargets);
  };

  const handleSaveMultiple = async () => {
    setAdding(true);
    try {
      const added = await addMultipleContacts(listId, targets);
      toast.success(`${added} target(s) successfully injected into audience.`);
      setTargets([{ phone: "", firstName: "", lastName: "" }]);
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to inject targets.");
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

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white shadow-md">
                <UserPlus className="w-4 h-4 mr-2" /> Add Multiple Targets
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-card border-border shadow-2xl overflow-hidden p-0">
              <DialogHeader className="px-6 py-4 border-b border-border bg-accent/30">
                <DialogTitle className="text-foreground font-bold">Inject Manual Targets</DialogTitle>
              </DialogHeader>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-background">
                {targets.map((t, i) => (
                  <div key={i} className="flex gap-4 items-center bg-accent/20 p-3 rounded-lg border border-border">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">Phone Number</Label>
                      <Input value={t.phone} onChange={(e) => updateRow(i, 'phone', e.target.value)} placeholder="+1234567890" className="bg-background focus-visible:ring-[#00D2FF] font-mono" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">First Name</Label>
                      <Input value={t.firstName} onChange={(e) => updateRow(i, 'firstName', e.target.value)} placeholder="Optional" className="bg-background" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">Last Name</Label>
                      <Input value={t.lastName} onChange={(e) => updateRow(i, 'lastName', e.target.value)} placeholder="Optional" className="bg-background" />
                    </div>
                    <div className="pt-5">
                      <Button variant="ghost" size="icon" onClick={() => removeRow(i)} disabled={targets.length === 1} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addRow} className="w-full border-dashed border-2 hover:bg-accent/50 text-muted-foreground">
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Another Row
                </Button>
              </div>

              <div className="px-6 py-4 border-t border-border bg-accent/10 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveMultiple} disabled={adding} className="bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-white">
                  <Save className="w-4 h-4 mr-2" /> {adding ? "Injecting..." : "Save All Targets"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          {/* ... Rest of the ContactManager Table code remains exactly the same ... */}
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