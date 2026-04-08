"use client";

import { useState } from "react";
import Papa from "papaparse";
import { importContactsBatch } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, Save, Trash2, Edit3, ChevronLeft, ChevronRight, FileSpreadsheet, CheckCircle2 } from "lucide-react";

export default function CsvImporter({ listId, listName, maxRows = 10000 }: { listId: string; listName: string; maxRows: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [step, setStep] = useState<"UPLOAD" | "REVIEW">("UPLOAD");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.ceil(parsedData.length / pageSize);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const rows = results.data as any[];
        if (rows.length > 0 && !Object.keys(rows[0]).includes("phone")) {
          return toast.error("CSV must contain a 'phone' column header.");
        }
        if (rows.length > maxRows) {
          return toast.error(`File too large. Maximum allowed is ${maxRows.toLocaleString()} contacts per file.`);
        }
        setParsedData(rows.map((row, i) => ({ ...row, _id: i })));
        setCurrentPage(1);
        setStep("REVIEW");
      },
    });
  };

  const handleCellEdit = (absoluteIndex: number, field: string, value: string) => {
    const newData = [...parsedData];
    newData[absoluteIndex][field] = value;
    setParsedData(newData);
  };

  const removeRow = (absoluteIndex: number) => {
    const newData = parsedData.filter((_, i) => i !== absoluteIndex);
    setParsedData(newData);
    const newTotalPages = Math.ceil(newData.length / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
  };

  const handleFinalImport = async () => {
    setIsUploading(true);
    setProgress(0);
    const BATCH_SIZE = 100;
    let totalAdded = 0;

    try {
      for (let i = 0; i < parsedData.length; i += BATCH_SIZE) {
        const batch = parsedData.slice(i, i + BATCH_SIZE).map((row) => ({
          phone: String(row.phone || ""),
          firstName: String(row.firstName || ""),
          lastName: String(row.lastName || ""),
        }));
        const added = await importContactsBatch(listId, batch);
        totalAdded += added;
        setProgress(Math.min(100, Math.round(((i + BATCH_SIZE) / parsedData.length) * 100)));
      }
      toast.success(`${totalAdded} targets imported successfully!`);
      setIsOpen(false);
      setTimeout(() => {
        setParsedData([]);
        setStep("UPLOAD");
      }, 500);
    } catch (error) {
      toast.error("An error occurred during import.");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setStep("UPLOAD"); setParsedData([]); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 bg-background text-foreground border-border hover:bg-accent hover:text-foreground">
          <UploadCloud className="w-4 h-4 mr-2 text-[#00D2FF]" /> Import CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl bg-card border-border shadow-2xl p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border bg-accent/30">
          <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
            {step === "UPLOAD" ? (
              <><UploadCloud className="w-5 h-5 text-[#00D2FF]" /> Inject Databank</>
            ) : (
              <><Edit3 className="w-5 h-5 text-[#A229C5]" /> Review & Audit Data</>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {step === "UPLOAD" && (
            <div className="relative border-2 border-dashed border-border rounded-xl p-16 text-center bg-accent/10 hover:bg-accent/30 transition-all group cursor-pointer flex flex-col items-center justify-center min-h-[300px]">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground group-hover:text-[#00D2FF] transition-colors mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Drag and drop your file here or click to browse. Ensure your file contains a <strong className="text-foreground">phone</strong> column.
              </p>
            </div>
          )}

          {step === "REVIEW" && (
            <div className="flex flex-col h-full overflow-hidden space-y-4">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-lg shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-semibold text-foreground">
                    <span className="text-emerald-500">{parsedData.length}</span> records detected and ready for injection
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Target: {listName}
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden flex flex-col flex-1 max-h-[50vh]">
                <div className="overflow-y-auto flex-1 bg-background relative">
                  <Table className="relative">
                    <TableHeader className="bg-accent/50 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-[100px] text-center font-bold text-muted-foreground">Row</TableHead>
                        <TableHead className="font-bold text-foreground">Phone (Required)</TableHead>
                        <TableHead className="font-bold text-foreground">First Name</TableHead>
                        <TableHead className="font-bold text-foreground">Last Name</TableHead>
                        <TableHead className="text-right font-bold text-foreground pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row, localIdx) => {
                        const absoluteIndex = (currentPage - 1) * pageSize + localIdx;
                        return (
                          <TableRow key={row._id || absoluteIndex} className="border-border hover:bg-accent/20 group">
                            <TableCell className="text-center text-xs font-mono text-muted-foreground">
                              {absoluteIndex + 1}
                            </TableCell>
                            <TableCell>
                              <Input
                                value={row.phone || ""}
                                onChange={(e) => handleCellEdit(absoluteIndex, "phone", e.target.value)}
                                className="h-8 bg-transparent border-transparent shadow-none hover:border-border focus:border-[#00D2FF] focus:bg-background rounded-sm px-2 font-mono text-sm transition-all"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={row.firstName || ""}
                                onChange={(e) => handleCellEdit(absoluteIndex, "firstName", e.target.value)}
                                className="h-8 bg-transparent border-transparent shadow-none hover:border-border focus:border-[#00D2FF] focus:bg-background rounded-sm px-2 text-sm transition-all"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={row.lastName || ""}
                                onChange={(e) => handleCellEdit(absoluteIndex, "lastName", e.target.value)}
                                className="h-8 bg-transparent border-transparent shadow-none hover:border-border focus:border-[#00D2FF] focus:bg-background rounded-sm px-2 text-sm transition-all"
                              />
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                                onClick={() => removeRow(absoluteIndex)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between p-3 border-t border-border bg-accent/30 shrink-0">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, parsedData.length)}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="h-7 px-2">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-bold px-2 font-mono text-foreground">PAGE {currentPage} / {totalPages || 1}</span>
                    <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="h-7 px-2">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {step === "REVIEW" && (
          <DialogFooter className="px-6 py-4 border-t border-border bg-accent/10 sm:justify-between items-center shrink-0">
            {isUploading ? (
              <div className="w-full flex items-center gap-4">
                <div className="flex-1 h-2 bg-background border border-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00D2FF] to-[#A229C5] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground font-mono">{progress}%</span>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => { setStep("UPLOAD"); setParsedData([]); }} className="text-muted-foreground hover:text-foreground">
                  Cancel & Restart
                </Button>
                <Button onClick={handleFinalImport} disabled={isUploading || parsedData.length === 0} className="bg-gradient-to-r from-[#00D2FF] to-[#A229C5] hover:opacity-90 border-0 text-white font-bold shadow-md h-10 px-6">
                  <Save className="w-4 h-4 mr-2" /> Confirm Injection
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}