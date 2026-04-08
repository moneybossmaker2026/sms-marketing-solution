import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Power, PowerOff, Wallet, ArrowUpCircle } from "lucide-react";
import { toggleUserStatus, addBalance } from "./actions";
import EditUserModal from "./EditUserModal";
import CreateUserModal from "./CreateUserModal";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const totalLiabilities = users.reduce((acc, user) => acc + user.balance, 0);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Identity Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Provision client workspaces, manage balances, and oversee system actors.
          </p>
        </div>
        <CreateUserModal />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Identities</p>
              <h3 className="text-3xl font-bold text-foreground">{totalUsers}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#00D2FF]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#00D2FF]" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Active Accounts</p>
              <h3 className="text-3xl font-bold text-foreground">{activeUsers}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Power className="w-6 h-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#00D2FF] to-[#A229C5]" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">System Liabilities</p>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#A229C5]">
                ${totalLiabilities.toFixed(2)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Wallet className="w-6 h-6 text-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 uppercase tracking-wide">
            <Users className="w-4 h-4 text-muted-foreground" />
            Network Roster
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-accent/30">
                <TableHead className="h-11 px-6 font-medium text-foreground whitespace-nowrap">Identity</TableHead>
                <TableHead className="h-11 font-medium text-foreground whitespace-nowrap">Status</TableHead>
                <TableHead className="h-11 font-medium text-foreground whitespace-nowrap">Wallet Balance</TableHead>
                <TableHead className="h-11 text-center font-medium text-foreground whitespace-nowrap">Fast Top-Up</TableHead>
                <TableHead className="h-11 px-6 text-right font-medium text-foreground whitespace-nowrap">Admin Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-border hover:bg-accent/50 transition-colors group">
                  <TableCell className="px-6 font-semibold text-foreground">
                    {user.username}
                    <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">REF: {user.id.split("-")[0].toUpperCase()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-accent text-muted-foreground border border-border">
                        {user.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${user.isActive ? 'bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
                        {user.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground font-mono">
                    ${user.balance.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center min-w-[150px]">
                    <form action={addBalance} className="inline-flex items-center gap-1 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                      <input type="hidden" name="userId" value={user.id} />
                      <Input
                        name="amount" type="number" step="0.01" min="0.01" placeholder="$0.00" required
                        className="w-20 h-8 bg-background text-xs font-mono focus-visible:ring-[#00D2FF]"
                      />
                      <Button variant="outline" size="sm" type="submit" className="h-8 w-8 p-0 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500" title="Add Funds Fast">
                        <ArrowUpCircle className="w-4 h-4" />
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="text-right px-6 space-x-2 whitespace-nowrap">
                    <EditUserModal user={user} />

                    <form action={toggleUserStatus.bind(null, user.id, !user.isActive)} className="inline-block">
                      <Button variant="ghost" size="icon" type="submit" className={`h-8 w-8 border border-transparent ${user.isActive ? 'text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10' : 'text-muted-foreground hover:text-[#00D2FF] hover:border-[#00D2FF]/30 hover:bg-[#00D2FF]/10'}`} title={user.isActive ? "Suspend User" : "Reactivate User"}>
                        {user.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
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