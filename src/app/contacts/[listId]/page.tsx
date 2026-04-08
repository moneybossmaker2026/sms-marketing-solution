import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";
import ContactManager from "./ContactManager";
import CsvImporter from "../CsvImporter";

export const dynamic = "force-dynamic";

export default async function ListDetailsPage({ params }: { params: { listId: string } }) {
  const session = await getSession();
  const csvLimitSetting = await db.setting.findUnique({ where: { key: "CSV_MAX_ROWS" } });
  const csvMaxRows = parseInt(csvLimitSetting?.value || "10000", 10);
  if (!session) redirect("/login");

  const list = await db.list.findUnique({
    where: { id: params.listId, userId: session.userId },
    include: {
      Contacts: {
        include: { contact: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!list) redirect("/contacts");

  const contacts = list.Contacts.map(lc => lc.contact);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/contacts" className="p-2 rounded-md bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors border border-border">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {list.name}
          </h2>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
            <Users className="w-4 h-4" /> {contacts.length} total contacts inside this audience
          </p>
        </div>
        <div className="ml-auto">
          <CsvImporter listId={list.id} listName={list.name} maxRows={csvMaxRows} />
        </div>
      </div>

      <ContactManager listId={list.id} initialContacts={contacts} />
    </div>
  );
}