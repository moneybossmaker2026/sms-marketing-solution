"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { getSession } from "@/lib/auth";

export async function createList(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  await db.list.create({
    data: {
      userId: session.userId,
      name,
      description
    }
  });

  revalidatePath("/contacts");
  revalidatePath("/campaigns");
}

export async function deleteList(listId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await db.campaign.deleteMany({
    where: { listId: listId, userId: session.userId }
  });

  await db.listContact.deleteMany({
    where: { list: { userId: session.userId }, listId: listId }
  });

  await db.list.deleteMany({
    where: { id: listId, userId: session.userId }
  });

  revalidatePath("/contacts");
  revalidatePath("/campaigns");
}

export async function importContactsBatch(
  listId: string,
  contacts: { phone: string; firstName?: string; lastName?: string }[]
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const list = await db.list.findFirst({
    where: { id: listId, userId: session.userId }
  });

  if (!list) throw new Error("List not found");

  let addedCount = 0;

  for (const c of contacts) {
    if (!c.phone) continue;

    let validPhone = "";
    try {
      const phoneNumber = parsePhoneNumberWithError(c.phone, "US"); // Defaults to US if country code is missing, auto-detects otherwise
      validPhone = phoneNumber.format("E.164");
    } catch (error) {
      continue;
    }

    try {
      const dbContact = await db.contact.upsert({
        where: {
          userId_phone: {
            userId: session.userId,
            phone: validPhone
          }
        },
        update: {
          firstName: c.firstName || undefined,
          lastName: c.lastName || undefined
        },
        create: {
          userId: session.userId,
          phone: validPhone,
          firstName: c.firstName || "",
          lastName: c.lastName || ""
        }
      });

      const existingLink = await db.listContact.findUnique({
        where: {
          listId_contactId: {
            listId,
            contactId: dbContact.id
          }
        }
      });

      if (!existingLink) {
        await db.listContact.create({
          data: { listId, contactId: dbContact.id }
        });
        addedCount++;
      }
    } catch (error) {
    }
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${listId}`);
  revalidatePath("/campaigns");
  return addedCount;
}

export async function addSingleContact(listId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const phoneRaw = formData.get("phone") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  let validPhone = "";
  try {
    const phoneNumber = parsePhoneNumberWithError(phoneRaw, "US");
    validPhone = phoneNumber.format("E.164");
  } catch (error) {
    throw new Error("Invalid phone number format.");
  }

  const dbContact = await db.contact.upsert({
    where: { userId_phone: { userId: session.userId, phone: validPhone } },
    update: { firstName, lastName },
    create: { userId: session.userId, phone: validPhone, firstName, lastName }
  });

  await db.listContact.upsert({
    where: { listId_contactId: { listId, contactId: dbContact.id } },
    update: {},
    create: { listId, contactId: dbContact.id }
  });

  revalidatePath(`/contacts/${listId}`);
  revalidatePath("/contacts");
}

export async function updateContact(contactId: string, listId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  await db.contact.update({
    where: { id: contactId, userId: session.userId },
    data: { firstName, lastName }
  });

  revalidatePath(`/contacts/${listId}`);
}

export async function removeContactFromList(listId: string, contactId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await db.listContact.delete({
    where: { listId_contactId: { listId, contactId } }
  });

  revalidatePath(`/contacts/${listId}`);
  revalidatePath("/contacts");
}