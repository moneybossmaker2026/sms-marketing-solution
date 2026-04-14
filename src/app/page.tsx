import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Send, AlertTriangle, Coins, Activity, Rocket } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const userId = session.userId;

  const totalContacts = await db.contact.count({ where: { userId } });
  const totalSent = await db.messageLog.count({ where: { userId, status: "SENT" } });
  const totalFailed = await db.messageLog.count({ where: { userId, status: "FAILED" } });
  const totalLogs = totalSent + totalFailed;

  const bounceRate = totalLogs > 0 ? ((totalFailed / totalLogs) * 100).toFixed(1) : "0.0";

  const costAggregate = await db.messageLog.aggregate({ where: { userId }, _sum: { cost: true } });
  const totalCost = costAggregate._sum.cost || 0.0;

  let providerBalance = null;
  if (session.role === "ADMIN") {
    try {
      const { headers } = await import("next/headers");
      const host = headers().get("host");
      const proto = process.env.NODE_ENV === "production" ? "https" : "http";
      const res = await fetch(`${proto}://${host}/api/provider-balance`, {
        headers: { Cookie: headers().get("cookie") || "" }
      });
      providerBalance = await res.json();
    } catch (e) {
      console.error("Failed to fetch provider balance", e);
    }
  }

  const recentCampaigns = await db.campaign.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      _count: {
        select: {
          MessageLogs: {
            where: { status: { in: ["SENT", "FAILED"] } }
          }
        }
      },
      list: { select: { _count: { select: { Contacts: true } } } }
    }
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back. Here is the operational status of your workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card className="relative overflow-hidden border-border bg-card shadow-sm group hover:border-muted-foreground/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Records</span>
              <div className="p-2 rounded-md bg-accent/50 border border-border text-foreground group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground tracking-tight">{totalContacts.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border bg-card shadow-sm group hover:border-[#00D2FF]/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00D2FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 w-full h-0.5 bg-[#00D2FF]/50" />
          <CardContent className="p-6 relative z-10">
             <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Successfully Dispatched</span>
              <div className="p-2 rounded-md bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-[#00D2FF] group-hover:bg-[#00D2FF] group-hover:text-white transition-all">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground tracking-tight">{totalSent.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border bg-card shadow-sm group hover:border-destructive/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 w-full h-0.5 bg-destructive/50" />
          <CardContent className="p-6 relative z-10">
             <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Network Bounce Rate</span>
              <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive group-hover:bg-destructive group-hover:text-white transition-all">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground tracking-tight">{bounceRate}%</span>
              <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-0.5 rounded-full">{totalFailed} drops</span>
            </div>
          </CardContent>
        </Card>

        {session.role === "ADMIN" && providerBalance ? (
          <Card className="relative overflow-hidden border-border bg-card shadow-sm group hover:border-emerald-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/50" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">EJOIN Provider Balance</span>
                <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 transition-colors">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-4xl font-black tracking-tight ${providerBalance.status === "success" ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {providerBalance.status === "not_configured" ? "N/A" : providerBalance.balance}
                </span>
                {providerBalance.status === "success" && <span className="text-xs font-bold text-muted-foreground">CREDITS</span>}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="relative overflow-hidden border-border bg-card shadow-sm group hover:border-[#A229C5]/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#A229C5]/10 to-[#00D2FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#00D2FF] to-[#A229C5]" />
            <CardContent className="p-6 relative z-10">
               <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Spend</span>
                <div className="p-2 rounded-md bg-accent/50 border border-border text-foreground group-hover:text-[#A229C5] transition-colors">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#A229C5] tracking-tight">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-border bg-card h-full">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#A229C5]" /> Carrier Delivery Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
             <div className="flex items-end gap-3">
              <div className="text-5xl font-black text-foreground">{100 - Number(bounceRate)}%</div>
              <div className="mb-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">Success Rate</div>
            </div>
            <div className="mt-8 h-3 w-full bg-accent rounded-full overflow-hidden flex border border-border shadow-inner">
              <div className="h-full bg-gradient-to-r from-[#00D2FF] to-[#A229C5]" style={{ width: `${100 - Number(bounceRate)}%` }}></div>
              <div className="h-full bg-destructive/80" style={{ width: `${bounceRate}%` }}></div>
            </div>
            <div className="flex justify-between mt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Delivered</span>
              <span>Bounced</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card h-full flex flex-col">
          <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between shrink-0">
            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Rocket className="h-4 w-4 text-[#00D2FF]" /> Recent Deployments
            </CardTitle>
            <Link href="/campaigns" className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground transition-colors bg-accent/50 px-2 py-1 rounded">View All</Link>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {recentCampaigns.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-sm text-muted-foreground">No recent deployments.</div>
            ) : (
              <div className="divide-y divide-border">
                {recentCampaigns.map(camp => {
                  const targetSize = camp.list._count.Contacts;
                  const progress = targetSize > 0 ? Math.round((camp._count.MessageLogs / targetSize) * 100) : 0;
                  return (
                    <div key={camp.id} className="p-4 hover:bg-accent/30 transition-colors flex justify-between items-center group">
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-[#00D2FF] transition-colors">{camp.name}</p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1 flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'COMPLETED' ? 'bg-[#A229C5]' : camp.status === 'PROCESSING' ? 'bg-[#00D2FF] animate-pulse' : 'bg-destructive'}`}></span>
                          {camp.status.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold font-mono text-foreground">{progress}%</div>
                        <div className="text-[10px] text-muted-foreground uppercase mt-0.5">Progress</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}