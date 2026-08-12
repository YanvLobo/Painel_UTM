import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyShopifyHmac } from "@/lib/shopify-hmac";
import { extractUtm } from "@/lib/utm-extract";

type ShopifyOrder = {
  id: number;
  order_number: number;
  total_price: string;
  currency: string;
  financial_status: string | null;
  email: string | null;
  created_at: string;
  note_attributes?: { name: string; value: string }[];
  landing_site?: string | null;
  referring_site?: string | null;
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");

  if (!verifyShopifyHmac(rawBody, hmacHeader)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const order = JSON.parse(rawBody) as ShopifyOrder;
  const utm = extractUtm(order);

  await prisma.order.upsert({
    where: { shopifyOrderId: String(order.id) },
    create: {
      shopifyOrderId: String(order.id),
      orderNumber: String(order.order_number),
      totalPrice: parseFloat(order.total_price),
      currency: order.currency,
      financialStatus: order.financial_status,
      customerEmail: order.email,
      createdAt: new Date(order.created_at),
      utm: { create: utm },
    },
    update: {
      totalPrice: parseFloat(order.total_price),
      financialStatus: order.financial_status,
      utm: {
        upsert: { create: utm, update: utm },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
