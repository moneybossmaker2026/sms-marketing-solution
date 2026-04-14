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

    if (pendingLogs.length === 0) return NextResponse.json({ status: "idle", message: "Queue Empty" });

    const logIds = pendingLogs.map(l => l.id);

    await db.messageLog.updateMany({
      where: { id: { in: logIds }, status: "PENDING" },
      data: { status: "QUEUED_FOR_SENDING" }
    });

    const logsToProcess = await db.messageLog.findMany({
      where: { id: { in: logIds }, status: "QUEUED_FOR_SENDING" },
      include: { contact: true, campaign: true }
    });

    const availableApis = await db.smsApi.findMany({ where: { isActive: true } });

    const logsByApi = new Map<string, typeof logsToProcess>();
    logsToProcess.forEach(log => {
      const api = availableApis.length > 0 ? availableApis[Math.floor(Math.random() * availableApis.length)] : null;
      if (!api) return;
      if (!logsByApi.has(api.id)) logsByApi.set(api.id,[]);
      logsByApi.get(api.id)!.push(log);
    });

    const { default: PQueue } = await import("p-queue");
    const queue = new PQueue({ concurrency: 15 });

    const priceSetting = await db.setting.findUnique({ where: { key: "SMS_PRICE" } });
    const perSmsCost = priceSetting ? parseFloat(priceSetting.value) : 0.07;
    const processedCampaignIds = new Set<string>();

    logsByApi.forEach((logs, apiId) => {
      const api = availableApis.find(a => a.id === apiId)!;
      let isEjoin = false;
      let ejoinData: any = {};

      try {
        const pObj = JSON.parse(api.payload);
        if (pObj.isEjoin) { isEjoin = true; ejoinData = pObj; }
      } catch (e) {}

      if (isEjoin) {
        // --- NATIVE EJOIN BATCH PROCESSING ---
        queue.add(async () => {
          logs.forEach(l => processedCampaignIds.add(l.campaignId!));
          const validLogs = logs.filter(l => !l.contact.isOptOut);
          const optOutLogs = logs.filter(l => l.contact.isOptOut);

          for (const l of optOutLogs) {
             await db.$transaction([
                db.messageLog.update({ where: { id: l.id }, data: { status: "FAILED", error: "Opt-Out" } }),
                db.user.update({ where: { id: l.userId }, data: { balance: { increment: perSmsCost } } })
             ]);
          }

          if (validLogs.length === 0) return;

          const smsarray = validLogs.map(log => {
            let finalMessage = log.campaign?.messageBody || "";
            finalMessage = finalMessage.replace(/{{firstName}}/g, log.contact.firstName || "");
            finalMessage = finalMessage.replace(/{{lastName}}/g, log.contact.lastName || "");

            // Format EJOIN payload (Strips '+' from numbers automatically)
            const payloadObj: any = {
              content: finalMessage,
              smstype: 0,
              numbers: log.contact.phone.replace(/^\+/, "")
            };

            // Add senderId if the campaign has one
            if (log.campaign?.senderId) {
                payloadObj.sender = log.campaign.senderId;
            }
            return payloadObj;
          });

          const baseUrl = api.url.endsWith('/') ? api.url.slice(0, -1) : api.url;
          const targetUrl = baseUrl.endsWith('sendsms') ? baseUrl : `${baseUrl}/sendsms`;

          const ejoinPayload = {
            account: ejoinData.account,
            password: ejoinData.password,
            smsarray
          };

          try {
            const res = await fetch(targetUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json;charset=utf-8" },
              body: JSON.stringify(ejoinPayload)
            });
            const result = await res.json();

            if (result.status === 0) {
              await db.messageLog.updateMany({
                where: { id: { in: validLogs.map(l => l.id) } },
                data: { status: "SENT" }
              });
              await db.smsApi.update({ where: { id: api.id }, data: { failCount: 0 } });
            } else {
              throw new Error(`EJOIN Code: ${result.status}`);
            }
          } catch (error: any) {
             const errStr = error.message.substring(0, 200);
             await db.smsApi.update({ where: { id: api.id }, data: { failCount: { increment: 1 }, lastError: errStr } });
             for (const l of validLogs) {
               await db.$transaction([
                  db.messageLog.update({ where: { id: l.id }, data: { status: "FAILED", error: "EJOIN Batch Failed" } }),
                  db.user.update({ where: { id: l.userId }, data: { balance: { increment: perSmsCost } } })
               ]);
             }
          }
        });
      } else {
        // --- GENERIC 1-BY-1 PROCESSING ---
        logs.forEach((log) => {
          queue.add(async () => {
             processedCampaignIds.add(log.campaignId!);
             const { contact, campaign, userId } = log;

             if (contact.isOptOut) {
               await db.$transaction([
                 db.messageLog.update({ where: { id: log.id }, data: { status: "FAILED", error: "Opt-Out" } }),
                 db.user.update({ where: { id: userId }, data: { balance: { increment: perSmsCost } } })
               ]);
               return;
             }

             let finalMessage = campaign?.messageBody || "";
             finalMessage = finalMessage.replace(/{{firstName}}/g, contact.firstName || "");
             finalMessage = finalMessage.replace(/{{lastName}}/g, contact.lastName || "");

             let parsedHeaders = {};
             try { parsedHeaders = JSON.parse(api.headers || "{}"); } catch (e) {}

             const safeMessage = JSON.stringify(finalMessage).slice(1, -1);
             const phoneNoPlus = contact.phone.replace(/^\+/, "");
             const phone00 = "00" + phoneNoPlus;

             let parsedPayload = api.payload;
             parsedPayload = parsedPayload.replace(/{{phone}}/g, contact.phone);
             parsedPayload = parsedPayload.replace(/{{phone_no_plus}}/g, phoneNoPlus);
             parsedPayload = parsedPayload.replace(/{{phone_00}}/g, phone00);
             parsedPayload = parsedPayload.replace(/{{message}}/g, safeMessage);
             parsedPayload = parsedPayload.replace(/{{senderId}}/g, campaign?.senderId || "");

             try {
               const res = await fetch(api.url, { method: "POST", headers: { "Content-Type": "application/json", ...parsedHeaders }, body: parsedPayload });
               if (!res.ok) throw new Error("HTTP " + res.status);

               await db.smsApi.update({ where: { id: api.id }, data: { failCount: 0 } });
               await db.messageLog.update({ where: { id: log.id }, data: { status: "SENT" } });
             } catch (error: any) {
               await db.smsApi.update({ where: { id: api.id }, data: { failCount: { increment: 1 }, lastError: error.message } });
               await db.$transaction([
                 db.messageLog.update({ where: { id: log.id }, data: { status: "FAILED", error: "HTTP Failed" } }),
                 db.user.update({ where: { id: userId }, data: { balance: { increment: perSmsCost } } })
               ]);
             }
          });
        });
      }
    });

    await queue.onIdle();

    const uniqueCampaignIds: string[] =[];
    processedCampaignIds.forEach(id => {
      if (id && !uniqueCampaignIds.includes(id)) uniqueCampaignIds.push(id);
    });

    for (const campaignId of uniqueCampaignIds) {
      const remainingPending = await db.messageLog.count({ where: { campaignId, status: { in:["PENDING", "QUEUED_FOR_SENDING"] } } });
      if (remainingPending === 0) {
        await db.campaign.update({ where: { id: campaignId }, data: { status: "COMPLETED" } });
      }
    }

    return NextResponse.json({ status: "success", processed: logsToProcess.length });

  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}