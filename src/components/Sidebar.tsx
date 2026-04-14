"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, MessageSquare, Users, Shield, Settings, LogOut, Menu, X, UserCircle, FileText } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { SidebarBalance } from "./SidebarBalance";

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems =[
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: MessageSquare },
    { href: "/contacts", label: "Audiences", icon: Users },
    { href: "/templates", label: "Templates", icon: FileText }, // NEW TEMPLATES LINK
    { href: "/profile", label: "My Profile", icon: UserCircle },
  ];

  if (role === "ADMIN") {
    navItems.push({ href: "/admin", label: "Users", icon: Shield });
    navItems.push({ href: "/settings", label: "Settings", icon: Settings });
  }

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 h-16 border-b border-border bg-card text-foreground shrink-0 w-full">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-[#00D2FF] to-[#A229C5] text-white font-bold text-sm shadow-[0_0_10px_rgba(0,210,255,0.3)]">
            U
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-lg">
            Utopia
          </span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col shrink-0`}>
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-[#00D2FF] to-[#A229C5] text-white font-bold text-sm shadow-[0_0_10px_rgba(0,210,255,0.3)]">
              U
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D2FF] to-[#A229C5] text-lg">
              Utopia
            </span>
          </Link>
        </div>

        <div className="pt-4 flex-1 overflow-y-auto">
          <SidebarBalance />
          <nav className="px-4 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2 mt-4">Workspace</div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-[#00D2FF]/10 to-[#A229C5]/10 text-white border border-[#00D2FF]/20 shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D2FF]' : ''}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border shrink-0">
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}