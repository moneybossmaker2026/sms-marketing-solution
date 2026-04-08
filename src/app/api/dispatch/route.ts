import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { campaignId, listId, messageBody } = await req.json();

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { user: true }
    });

    if (!campaign || campaign.userId !== session.userId) {
      throw new Error("Campaign not found or unauthorized.");
    }

    const listContacts = await db.listContact.findMany({
      where: { listId },
      include: { contact: true }
    });

    if (listContacts.length === 0) {
      return NextResponse.json({ error: "Target audience is empty." }, { status: 400 });
    }

    const priceSetting = await db.setting.findUnique({ where: { key: "SMS_PRICE" } });
    const perSmsCost = priceSetting ? parseFloat(priceSetting.value) : 0.07;
    const totalCost = listContacts.length * perSmsCost;

    await db.$transaction(async (prisma) => {
      const currentUser = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!currentUser || currentUser.balance < totalCost) {
        throw new Error("Insufficient balance");
      }
      await prisma.user.update({
        where: { id: session.userId },
        data: { balance: { decrement: totalCost } }
      });
    });

    await db.campaign.update({
      where: { id: campaignId },
      data: { status: "PROCESSING" }
    });

    const logData = listContacts.map(lc => ({
      userId: session.userId,
      campaignId,
      contactId: lc.contact.id,
      status: "PENDING",
      cost: perSmsCost,
    }));

    await db.messageLog.createMany({
      data: logData
    });

    return NextResponse.json({ success: true, message: "Campaign successfully queued for deployment." });

  } catch (error: any) {
    if (error.message === "Insufficient balance") {
      try {
        const payload = await req.clone().json();
        await db.campaign.update({
          where: { id: payload.campaignId },
          data: { status: "FAILED_INSUFFICIENT_FUNDS" }
        });
      } catch (e) {}
      return NextResponse.json({ error: "Insufficient account balance." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}