import { prisma } from "@/lib/prisma";

export type DashboardFilters = {
  from?: Date;
  to?: Date;
  utmSource?: string;
};

function whereClause(filters: DashboardFilters) {
  return {
    createdAt: {
      gte: filters.from,
      lte: filters.to,
    },
    utm: filters.utmSource ? { utmSource: filters.utmSource } : undefined,
  };
}

export async function getSummary(filters: DashboardFilters) {
  const orders = await prisma.order.findMany({
    where: whereClause(filters),
    select: { totalPrice: true },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
  const orderCount = orders.length;
  const averageTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

  return { totalRevenue, orderCount, averageTicket };
}

export async function getRevenueBySource(filters: DashboardFilters) {
  const orders = await prisma.order.findMany({
    where: whereClause(filters),
    select: { totalPrice: true, utm: { select: { utmSource: true } } },
  });

  const bySource = new Map<string, number>();
  for (const order of orders) {
    const key = order.utm?.utmSource ?? "(sem UTM)";
    bySource.set(key, (bySource.get(key) ?? 0) + Number(order.totalPrice));
  }

  return Array.from(bySource.entries())
    .map(([source, revenue]) => ({ source, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getRevenueOverTime(filters: DashboardFilters) {
  const orders = await prisma.order.findMany({
    where: whereClause(filters),
    select: { totalPrice: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byDay = new Map<string, number>();
  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + Number(order.totalPrice));
  }

  return Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue }));
}

export async function getOrders(filters: DashboardFilters) {
  const orders = await prisma.order.findMany({
    where: whereClause(filters),
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { utm: true },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    totalPrice: Number(o.totalPrice),
    currency: o.currency,
    utmSource: o.utm?.utmSource ?? null,
    utmMedium: o.utm?.utmMedium ?? null,
    utmCampaign: o.utm?.utmCampaign ?? null,
    utmTerm: o.utm?.utmTerm ?? null,
    utmContent: o.utm?.utmContent ?? null,
    referrer: o.utm?.referrer ?? null,
  }));
}

export async function getDistinctSources() {
  const rows = await prisma.utmAttribution.findMany({
    where: { utmSource: { not: null } },
    select: { utmSource: true },
    distinct: ["utmSource"],
  });
  return rows.map((r) => r.utmSource as string).sort();
}
