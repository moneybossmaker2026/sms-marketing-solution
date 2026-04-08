"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getCampaignStatuses() {
  const session = await getSession();
  if (!session) return [];

  const campaigns = await db.campaign.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      list: { include: { _count: { select: { Contacts: true } } } },
      _count: {
        select: {
          MessageLogs: {
            where: { status: { in: ["SENT", "FAILED"] } }
          }
        }
      }
    }
  });

  return campaigns.map(c => {
    const totalTargets = c.list._count.Contacts;
    const completedLogs = c._count.MessageLogs;
    const progress = totalTargets > 0 ? Math.min(Math.round((completedLogs / totalTargets) * 100), 100) : 0;

    return {
      id: c.id,
      name: c.name,
      listName: c.list.name,
      status: c.status,
      totalTargets,
      completedLogs,
      progress,
      messageBody: c.messageBody,
    };
  });
}