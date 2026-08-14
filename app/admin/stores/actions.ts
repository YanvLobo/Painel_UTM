"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "AGENCY_ADMIN") {
    throw new Error("Não autorizado");
  }
}

export async function createStore(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const shopifyDomain = String(formData.get("shopifyDomain") || "").trim();
  const webhookSecret = String(formData.get("webhookSecret") || "").trim();
  const clientEmail = String(formData.get("clientEmail") || "").trim();
  const clientPassword = String(formData.get("clientPassword") || "").trim();

  if (!name || !shopifyDomain || !webhookSecret) {
    throw new Error("Nome, domínio e webhook secret são obrigatórios.");
  }

  const store = await prisma.store.create({
    data: { name, shopifyDomain, webhookSecret },
  });

  if (clientEmail && clientPassword) {
    const hashed = await bcrypt.hash(clientPassword, 10);
    await prisma.user.upsert({
      where: { email: clientEmail },
      create: { email: clientEmail, password: hashed, role: "CLIENT", storeId: store.id },
      update: { password: hashed, role: "CLIENT", storeId: store.id },
    });
  }

  revalidatePath("/admin/stores");
}

export async function deleteStore(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.store.delete({ where: { id } });
  revalidatePath("/admin/stores");
}
