"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createTemplate(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const content = formData.get("content") as string;

  await db.smsTemplate.create({
    data: {
      userId: session.userId,
      name,
      content
    }
  });

  revalidatePath("/templates");
}

export async function updateTemplate(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const content = formData.get("content") as string;

  await db.smsTemplate.update({
    where: { id, userId: session.userId },
    data: { name, content }
  });

  revalidatePath("/templates");
}

export async function deleteTemplate(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await db.smsTemplate.deleteMany({
    where: { id, userId: session.userId }
  });

  revalidatePath("/templates");
}