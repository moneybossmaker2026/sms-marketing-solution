"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createDraftCampaign(name: string, listId: string, messageBody: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const campaign = await db.campaign.create({
    data: {
      userId: session.userId,
      name,
      listId,
      messageBody,
      status: "DRAFT",
    }
  });

  revalidatePath("/campaigns");
  return campaign.id;
}

export async function deleteCampaign(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await db.campaign.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/campaigns");
}