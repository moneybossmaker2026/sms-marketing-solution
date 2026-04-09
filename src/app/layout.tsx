import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Utopia | Enterprise Platform",
  description: "Advanced Local Dispatch System",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  const session = await getSession();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground`}>
        {session && <Sidebar role={session.role} />}

        <main className="flex-1 overflow-y-auto relative z-10 w-full">
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}