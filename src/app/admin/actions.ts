"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hashPassword, getSession } from "@/lib/auth";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
}

export async function createUser(formData: FormData) {
  await verifyAdmin();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const balance = parseFloat(formData.get("balance") as string);

  const hashedPassword = await hashPassword(password);

  await db.user.create({
    data: { username, password: hashedPassword, role, balance }
  });

  revalidatePath("/admin");
}

export async function updateUser(formData: FormData) {
  await verifyAdmin();

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  const balance = parseFloat(formData.get("balance") as string);
  const password = formData.get("password") as string;

  if (!userId || isNaN(balance) || balance < 0) {
    throw new Error("Invalid parameters provided.");
  }

  const updateData: any = { role, balance };

  if (password && password.trim() !== "") {
    updateData.password = await hashPassword(password);
  }

  await db.user.update({ where: { id: userId }, data: updateData });
  revalidatePath("/admin");
}

export async function addBalance(formData: FormData) {
  await verifyAdmin();

  const userId = formData.get("userId") as string;
  const amount = parseFloat(formData.get("amount") as string);

  if (!userId || isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount.");
  }

  await db.user.update({
    where: { id: userId },
    data: { balance: { increment: amount } }
  });

  revalidatePath("/admin");
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  await verifyAdmin();
  await db.user.update({ where: { id: userId }, data: { isActive } });
  revalidatePath("/admin");
}