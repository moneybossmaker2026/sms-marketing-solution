"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized access.");
  }
}

export async function saveGlobalSetting(key: string, value: string) {
  await verifyAdmin();
  await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidatePath("/settings");
}

export async function createSmsApi(formData: FormData) {
  await verifyAdmin();
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const headers = formData.get("headers") as string;
  const payload = formData.get("payload") as string;

  await db.smsApi.create({
    data: { name, url, headers, payload }
  });
  revalidatePath("/settings");
}

export async function updateSmsApi(formData: FormData) {
  await verifyAdmin();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const headers = formData.get("headers") as string;
  const payload = formData.get("payload") as string;

  await db.smsApi.update({
    where: { id },
    data: { name, url, headers, payload }
  });
  revalidatePath("/settings");
}

export async function deleteSmsApi(id: string) {
  await verifyAdmin();
  await db.smsApi.delete({ where: { id } });
  revalidatePath("/settings");
}

export async function toggleSmsApi(id: string, isActive: boolean) {
  await verifyAdmin();
  await db.smsApi.update({ where: { id }, data: { isActive, failCount: 0 } });
  revalidatePath("/settings");
}