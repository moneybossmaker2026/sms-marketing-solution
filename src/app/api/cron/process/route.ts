import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const BATCH_SIZE = 150;

  try {
    const pendingLogs = await db.messageLog.findMany({
      where: { status: "PENDING" },
      take: BATCH_SIZE,
      select: { id: true }
    });

    if (pendingLogs.length === 0) {
      return NextResponse.json({ status: "idle", message: "Queue Empty" });
    }

    const logIds = pendingLogs.map(l => l.id);

    await db.messageLog.updateMany({
      where: { id: { in: logIds }, status: "PENDING" },
      data: { status: "QUEUED_FOR_SENDING" }
    });

    const logsToProcess = await db.messageLog.findMany({
      where: { id: { in: logIds }, status: "QUEUED_FOR_SENDING" },
      include: { contact: true, campaign: true }
    });

    let availableApis = await db.smsApi.findMany({ where: { isActive: true } });
    const { default: PQueue } = await import("p-queue");
    const queue = new PQueue({ concurrency: 15 });

    const priceSetting = await db.setting.findUnique({ where: { key: "SMS_PRICE" } });
    const perSmsCost = priceSetting ? parseFloat(priceSetting.value) : 0.07;

    const processedCampaignIds = new Set<string>();

    await Promise.all(logsToProcess.map((log) =>
      queue.add(async () => {
        processedCampaignIds.add(log.campaignId!);
        const { contact, campaign, userId } = log;

        if (availableApis.length === 0 || contact.isOptOut) {
          await db.$transaction([
            db.messageLog.update({
              where: { id: log.id },
              data: { status: "FAILED", error: contact.isOptOut ? "Opt-Out Skipped" : "No Active APIs" }
            }),
            db.user.update({
              where: { id: userId },
              data: { balance: { increment: perSmsCost } }
            })
          ]);
          return;
        }

        const api = availableApis[Math.floor(Math.random() * availableApis.length)];

        let finalMessage = campaign?.messageBody || "";
        finalMessage = finalMessage.replace(/{{firstName}}/g, contact.firstName || "");
        finalMessage = finalMessage.replace(/{{lastName}}/g, contact.lastName || "");
        finalMessage = finalMessage.replace(/{{contactId}}/g, contact.id);

        let parsedHeaders = {};
        try { parsedHeaders = JSON.parse(api.headers || "{}"); } catch (e) {}

        const safeMessage = JSON.stringify(finalMessage).slice(1, -1);

        // DYNAMIC PHONE VARIABLES PARSING
        const phoneNoPlus = contact.phone.replace(/^\+/, "");
        const phone00 = "00" + phoneNoPlus;

        let parsedPayload = api.payload;
        parsedPayload = parsedPayload.replace(/{{phone}}/g, contact.phone);
        parsedPayload = parsedPayload.replace(/{{phone_no_plus}}/g, phoneNoPlus);
        parsedPayload = parsedPayload.replace(/{{phone_00}}/g, phone00);
        parsedPayload = parsedPayload.replace(/{{message}}/g, safeMessage);

        try {
          const response = await fetch(api.url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...parsedHeaders },
            body: parsedPayload,
          });

          if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            const errorMessage = `[HTTP ${response.status}] ${errorText.substring(0, 500)}`;

            const dbApi = await db.smsApi.update({
              where: { id: api.id },
              data: {
                failCount: { increment: 1 },
                lastError: errorMessage
              }
            });

            if (dbApi.failCount >= 5) {
              await db.smsApi.update({ where: { id: api.id }, data: { isActive: false } });
              availableApis = availableApis.filter(a => a.id !== api.id);
            }
            throw new Error("API Route Failed");
          }

          await db.smsApi.update({ where: { id: api.id }, data: { failCount: 0 } });
          await db.messageLog.update({
            where: { id: log.id },
            data: { status: "SENT" }
          });

        } catch (error: any) {
          await db.$transaction([
            db.messageLog.update({
              where: { id: log.id },
              data: { status: "FAILED", error: "API Rotation Error" }
            }),
            db.user.update({
              where: { id: userId },
              data: { balance: { increment: perSmsCost } }
            })
          ]);
        }
      })
    ));

    for (const campaignId of Array.from(processedCampaignIds)) {
      if (!campaignId) continue;
      const remainingPending = await db.messageLog.count({
        where: { campaignId, status: { in:["PENDING", "QUEUED_FOR_SENDING"] } }
      });

      if (remainingPending === 0) {
        await db.campaign.update({
          where: { id: campaignId },
          data: { status: "COMPLETED" }
        });
      }
    }

    return NextResponse.json({ status: "success", processed: logsToProcess.length });

  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}