import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Trash2 } from "lucide-react";
import { CreateTemplateModal, EditTemplateModal } from "./TemplateModals";
import { deleteTemplate } from "./actions";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const templates = await db.smsTemplate.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Message Templates</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Create reusable SMS blueprints to speed up your campaign deployments.
          </p>
        </div>
        <CreateTemplateModal />
      </div>

      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Template Library
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-accent/30">
                <TableHead className="h-11 px-6 font-medium text-foreground whitespace-nowrap">Template Name</TableHead>
                <TableHead className="h-11 font-medium text-foreground w-1/2">Message Preview</TableHead>
                <TableHead className="h-11 px-6 text-right font-medium text-foreground whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-16 text-sm text-muted-foreground">
                    Your template library is empty.
                  </TableCell>
                </TableRow>
              )}
              {templates.map((tpl) => (
                <TableRow key={tpl.id} className="border-border hover:bg-accent/50 transition-colors group">
                  <TableCell className="px-6 font-semibold text-foreground whitespace-nowrap">
                    {tpl.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="max-w-[400px] truncate bg-background px-3 py-1.5 rounded border border-border font-mono text-[12px]">
                      {tpl.content}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6 space-x-2 whitespace-nowrap">
                    <EditTemplateModal template={tpl} />
                    <form action={deleteTemplate.bind(null, tpl.id)} className="inline-block">
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
    </div>
  );
}