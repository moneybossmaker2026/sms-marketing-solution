import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData);
    }

    const phone = body.From || body.sender || body.msisdn || body.phone;
    const text = (body.Body || body.text || body.message || "").trim().toLowerCase();

    if (phone && ["stop", "unsubscribe", "cancel", "quit"].includes(text)) {
      const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

      await db.contact.updateMany({
        where: { phone: normalizedPhone },
        data: { isOptOut: true }
      });

      console.log(`[Webhook] Opt-out processed for phone: ${normalizedPhone}`);
    }

    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}