import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, createSession, comparePassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  async function loginAction(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const user = await db.user.findUnique({ where: { username } });
    if (!user || !user.isActive) {
      redirect("/login?error=Invalid credentials or account disabled");
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      redirect("/login?error=Invalid credentials");
    }

    await createSession(user.id, user.role);
    revalidatePath("/", "layout");
    redirect("/");
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
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your workspace</p>
        </div>

        <Card className="border-border shadow-2xl shadow-black/50 bg-card/80 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-medium text-foreground">Sign In</CardTitle>
            <CardDescription>Enter your username and password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required className="bg-background border-border focus-visible:ring-[#A229C5]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required className="bg-background border-border focus-visible:ring-[#A229C5]" />
              </div>
              <Button type="submit" className="w-full font-medium h-10 mt-2 bg-gradient-to-r from-[#00D2FF] to-[#A229C5] hover:opacity-90 transition-opacity border-0 text-white shadow-md">
                Continue
              </Button>

              <div className="text-center mt-4">
                <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Don&apos;t have an account? Sign Up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}