import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    const url = new URL(req.url);
    const contactId = url.searchParams.get("c"); 

    const link = await db.link.findUnique({ where: { code } });

    if (!link) return new NextResponse("Signal lost. Destination not found.", { status: 404 });

    db.linkClick.create({
      data: {
        linkId: link.id,
        contactId: contactId || null,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      }
    }).catch(console.error);

    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    return new NextResponse("System error during routing.", { status: 500 });
  }
}