"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createShortLink(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const originalUrl = formData.get("originalUrl") as string;
  const customCode = formData.get("code") as string;

  const code = customCode || Math.random().toString(36).substring(2, 8);

  await db.link.create({
    data: {
      userId: session.userId,
      originalUrl,
      code
    }
  });

  revalidatePath("/links");
}

export async function deleteLink(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await db.link.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/links");
}