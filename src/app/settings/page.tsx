import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSettings from "./AdminSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const dbSettings = await db.setting.findMany();
  const settingsMap: Record<string, string> = {};
  dbSettings.forEach(s => { settingsMap[s.key] = s.value; });

  const apis = await db.smsApi.findMany({
    select: {
      id: true,
      name: true,
      url: true,
      isActive: true,
      failCount: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Platform Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          System-wide configurations and multi-API gateway controls.
        </p>
      </div>

      <AdminSettings settings={settingsMap} apis={apis} />
    </div>
  );
}