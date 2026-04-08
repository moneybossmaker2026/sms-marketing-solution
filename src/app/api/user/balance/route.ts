import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { balance: true }
  });

  const tgSetting = await db.setting.findUnique({
    where: { key: "TELEGRAM_SUPPORT_HANDLE" }
  });

  return NextResponse.json({
    balance: user?.balance || 0,
    telegramHandle: tgSetting?.value || "utopiasupport",
    userId: session.userId
  });
}