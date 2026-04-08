"use server";

import { db } from "@/lib/db";
import { getSession, hashPassword, comparePassword } from "@/lib/auth";

export async function updatePassword(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords do not match.");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) throw new Error("User not found.");

  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    throw new Error("Current password is incorrect.");
  }

  const hashedPassword = await hashPassword(newPassword);

  await db.user.update({
    where: { id: session.userId },
    data: { password: hashedPassword }
  });

  return { success: true };
}