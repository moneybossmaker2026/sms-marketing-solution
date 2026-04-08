import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;

  async function registerAction(formData: FormData) {
    "use server";

    const botField = formData.get("contact_url") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const n1 = parseInt(formData.get("num1") as string, 10);
    const n2 = parseInt(formData.get("num2") as string, 10);
    const answer = parseInt(formData.get("bot_answer") as string, 10);

    if (botField) {
      redirect("/register?error=Invalid submission");
    }

    if (n1 + n2 !== answer) {
      redirect("/register?error=Security challenge failed. Please try again.");
    }

    if (!username || !password || password.length < 6) {
      redirect("/register?error=Invalid username or password too short (min 6 chars)");
    }

    const existing = await db.user.findUnique({ where: { username } });
    if (existing) {
      redirect("/register?error=Username already taken");
    }

    const hashedPassword = await hashPassword(password);

    await db.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "USER",
        balance: 0.0,
      }
    });

    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 antialiased relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#00D2FF]/10 to-[#A229C5]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D2FF] to-[#A229C5] flex items-center justify-center text-white font-black text-3xl shadow-[0_0_25px_rgba(162,41,197,0.4)] mb-4">
            U
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00D2FF] to-[#A229C5]">
            Utopia
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Create your workspace account</p>
        </div>

        <Card className="border-border shadow-2xl shadow-black/50 bg-card/80 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-medium text-foreground">Sign Up</CardTitle>
            <CardDescription>Enter your details below to register.</CardDescription>
            {searchParams.error && (
              <div className="p-3 mt-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md font-medium">
                {searchParams.error}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form action={registerAction} className="space-y-4">
              {/* Honeypot field - Bots will fill this in */}
              <input type="text" name="contact_url" className="hidden" tabIndex={-1} autoComplete="off" />
              <input type="hidden" name="num1" value={num1} />
              <input type="hidden" name="num2" value={num2} />

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required className="bg-background border-border focus-visible:ring-[#A229C5]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} className="bg-background border-border focus-visible:ring-[#A229C5]" />
              </div>

              <div className="space-y-2 p-3 bg-accent/30 rounded-md border border-border mt-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Security Challenge</Label>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-foreground bg-background px-3 py-1 rounded border border-border">
                    {num1} + {num2} =
                  </span>
                  <Input name="bot_answer" type="number" required placeholder="?" className="w-20 font-mono text-center bg-background border-border focus-visible:ring-[#00D2FF]" />
                </div>
              </div>

              <Button type="submit" className="w-full font-medium h-10 mt-4 bg-gradient-to-r from-[#00D2FF] to-[#A229C5] hover:opacity-90 transition-opacity border-0 text-white shadow-md">
                Create Account
              </Button>

              <div className="text-center mt-4">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-[#00D2FF] transition-colors">
                  Already have an account? Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}