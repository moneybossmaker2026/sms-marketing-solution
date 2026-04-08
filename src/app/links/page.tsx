import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createShortLink, deleteLink } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Radar, Link as LinkIcon, MousePointerClick, Trash2, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const links = await db.link.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { Clicks: true } }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Link Tracking
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Generate short links, track click-through rates, and monitor engagement.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                Create Tracking Link
              </CardTitle>
              <CardDescription className="mt-1">Shorten a URL to track campaign clicks.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={createShortLink} className="space-y-4">
                <div className="space-y-2">
                  <Label>Destination URL</Label>
                  <Input name="originalUrl" required placeholder="https://yourstore.com/sale" className="bg-background focus-visible:ring-[#00D2FF]" />
                </div>
                <div className="space-y-2">
                  <Label>Custom Code (Optional)</Label>
                  <Input name="code" placeholder="e.g. BF2026" className="bg-background focus-visible:ring-[#A229C5]" />
                </div>
                <Button type="submit" className="w-full h-10 bg-gradient-to-r from-[#00D2FF] to-[#A229C5] hover:opacity-90 border-0 text-white font-medium shadow-md transition-opacity">
                  Generate Link
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-md border border-border bg-accent/50">
                <h4 className="text-foreground text-sm font-medium flex items-center gap-1.5 mb-2">
                  <Info className="w-4 h-4 text-muted-foreground" /> Usage Instructions
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In your campaign message, write your link like this: <br/>
                  <code className="text-foreground bg-background border border-border px-1.5 py-0.5 rounded mt-1.5 inline-block font-mono text-[11px]">
                    https://[YOUR-DOMAIN]/r/CODE?c={`{{contactId}}`}
                  </code>
                  <br/><br/>
                  This ensures we track exactly which contact clicked the link.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-sm border-border bg-card h-full">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Radar className="w-4 h-4 text-muted-foreground" />
                Active Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="h-11 px-6 font-medium text-muted-foreground">Short Code</TableHead>
                    <TableHead className="h-11 font-medium text-muted-foreground">Target URL</TableHead>
                    <TableHead className="h-11 font-medium text-muted-foreground text-center">Total Clicks</TableHead>
                    <TableHead className="h-11 px-6 text-right font-medium text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-12 text-sm">
                        No tracking links generated yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {links.map((link) => (
                    <TableRow key={link.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <TableCell className="px-6 py-4">
                        <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#A229C5] font-semibold bg-accent border border-border px-2.5 py-1 rounded-md text-sm">
                          {link.code}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={link.originalUrl}>
                        {link.originalUrl}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 text-foreground font-medium text-sm">
                          <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                          {link._count.Clicks}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <form action={deleteLink.bind(null, link.id)}>
                          <Button variant="ghost" size="icon" type="submit" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
}