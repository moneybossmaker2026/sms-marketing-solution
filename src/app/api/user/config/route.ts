import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const priceSetting = await db.setting.findUnique({ where: { key: "SMS_PRICE" } });
  return NextResponse.json({ smsPrice: parseFloat(priceSetting?.value || "0.07") });
}