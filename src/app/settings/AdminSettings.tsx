"use client";

import { useState } from "react";
import { saveGlobalSetting, deleteSmsApi, toggleSmsApi } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Server, Trash2, Power, PowerOff, AlertTriangle, Activity, DollarSign, MessageCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AddApiModal from "./AddApiModal";
import EditApiModal from "./EditApiModal";
import ApiLogsModal from "./ApiLogsModal";

type ApiType = { id: string, name: string, url: string, headers: string, payload: string, isActive: boolean, failCount: number, lastError: string | null };

export default function AdminSettings({ settings, apis }: { settings: Record<string, string>, apis: ApiType[] }) {
  const [tgHandle, setTgHandle] = useState(settings["TELEGRAM_SUPPORT_HANDLE"] || "utopiasupport");
  const [smsPrice, setSmsPrice] = useState(settings["SMS_PRICE"] || "0.07");
  const[csvLimit, setCsvLimit] = useState(settings["CSV_MAX_ROWS"] || "10000");
  const [loading, setLoading] = useState(false);

  const handleSaveGlobals = async () => {
    setLoading(true);
    try {
      await saveGlobalSetting("TELEGRAM_SUPPORT_HANDLE", tgHandle);
      await saveGlobalSetting("SMS_PRICE", smsPrice);
      await saveGlobalSetting("CSV_MAX_ROWS", csvLimit);
      toast.success("System configurations updated securely.");
    } catch (e) {
      toast.error("Failed to update settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-sm border-border bg-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00D2FF] to-[#A229C5]" />
        <CardHeader className="border-b border-border pb-4 pt-6">
          <CardTitle className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
            <Server className="w-4 h-4 text-[#00D2FF]" />
            Global System Variables
          </CardTitle>
          <CardDescription>Adjust the global billing parameters and limits.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3 items-end">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground"><DollarSign className="w-3.5 h-3.5" /> Network SMS Price ($)</Label>
              <Input type="number" step="0.001" value={smsPrice} onChange={(e) => setSmsPrice(e.target.value)} className="bg-background focus-visible:ring-[#00D2FF] font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="w-3.5 h-3.5" /> Telegram Support</Label>
              <Input value={tgHandle} onChange={(e) => setTgHandle(e.target.value)} className="bg-background focus-visible:ring-[#00D2FF]" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground"><Server className="w-3.5 h-3.5" /> Max CSV Rows</Label>
              <Input type="number" value={csvLimit} onChange={(e) => setCsvLimit(e.target.value)} className="bg-background focus-visible:ring-[#00D2FF] font-mono" />
            </div>
            <div className="md:col-span-3">
              <Button onClick={handleSaveGlobals} disabled={loading} className="w-full h-10 bg-gradient-to-r from-[#00D2FF] to-[#A229C5] hover:opacity-90 border-0 text-white font-bold shadow-md">
                <Save className="w-4 h-4 mr-2" /> {loading ? "Committing..." : "Commit Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border bg-card h-full">
        <CardHeader className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-[#A229C5]" />
              Routing Gateways & Load Balancing
            </CardTitle>
            <CardDescription className="mt-1">Manage active SMS API nodes. Traffic is distributed evenly.</CardDescription>
          </div>
          <AddApiModal />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-accent/30">
                <TableHead className="h-11 px-6 font-medium text-foreground whitespace-nowrap">Node Provider</TableHead>
                <TableHead className="h-11 font-medium text-foreground whitespace-nowrap">Status & Health</TableHead>
                <TableHead className="h-11 px-6 text-right font-medium text-foreground whitespace-nowrap">Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apis.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center py-16 text-sm text-muted-foreground font-mono">No routing nodes detected. System halted.</TableCell></TableRow>
              )}
              {apis.map((api) => (
                <TableRow key={api.id} className="border-border hover:bg-accent/50 transition-colors">
                  <TableCell className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">{api.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex gap-3 items-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${api.isActive ? 'bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
                        {api.isActive ? 'ONLINE' : 'OFFLINE'}
                      </span>
                      {api.failCount > 0 && (
                        <>
                          <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-destructive bg-destructive/10 px-2 py-0.5 rounded border border-destructive/30">
                            <AlertTriangle className="w-3 h-3" /> Fails: {api.failCount}/5
                          </span>
                          <ApiLogsModal apiName={api.name} lastError={api.lastError} />
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6 space-x-2 whitespace-nowrap">
                    <EditApiModal api={api} />
                    <form action={toggleSmsApi.bind(null, api.id, !api.isActive)} className="inline-block">
                      <Button variant="ghost" size="icon" type="submit" className={`h-9 w-9 border border-transparent ${api.isActive ? 'text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10' : 'text-muted-foreground hover:text-[#00D2FF] hover:border-[#00D2FF]/30 hover:bg-[#00D2FF]/10'}`} title={api.isActive ? "Disable Node" : "Enable Node"}>
                        {api.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </Button>
                    </form>
                    <form action={deleteSmsApi.bind(null, api.id)} className="inline-block">
                      <Button variant="ghost" size="icon" type="submit" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
    </div>
  );
}