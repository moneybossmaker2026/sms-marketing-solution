import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createList, deleteList } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Users, FolderPlus, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const session = await getSession();
  const csvLimitSetting = await db.setting.findUnique({ where: { key: "CSV_MAX_ROWS" } });
  const csvMaxRows = parseInt(csvLimitSetting?.value || "10000", 10);
  if (!session) redirect("/login");

  const lists = await db.list.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { Contacts: true } }
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Audience Vault
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Organize your targets. Select an audience to manage contacts.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <Card className="shadow-sm border-dashed border-2 border-border bg-transparent hover:bg-accent/20 transition-colors flex flex-col justify-center items-center min-h-[220px]">
          <CardContent className="p-6 w-full text-center">
            <FolderPlus className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <form action={createList} className="space-y-3 w-full">
              <Input name="name" required placeholder="New Audience Name" className="bg-background text-center focus-visible:ring-[#00D2FF]" />
              <Input name="description" placeholder="Short description..." className="bg-background text-center focus-visible:ring-[#A229C5]" />
              <Button type="submit" variant="secondary" className="w-full font-medium">
                Create Audience
              </Button>
            </form>
          </CardContent>
        </Card>

        {lists.map((list) => (
          <Card key={list.id} className="shadow-sm border-border bg-card flex flex-col hover:border-[#00D2FF]/50 transition-colors group relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground truncate" title={list.name}>
                {list.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{list.description || "No description provided."}</p>
            </CardHeader>
            <CardContent className="mt-auto pb-4">
              <div className="flex items-center gap-2 mb-4 bg-accent/30 w-fit px-3 py-1.5 rounded-md border border-border">
                <Users className="w-4 h-4 text-[#00D2FF]" />
                <span className="text-sm font-semibold text-foreground">{list._count.Contacts} Contacts</span>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/contacts/${list.id}`} className="flex-1">
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                    Manage <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <form action={deleteList.bind(null, list.id)}>
                  <Button variant="outline" size="icon" type="submit" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}