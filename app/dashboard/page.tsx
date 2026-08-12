import {
  getDistinctSources,
  getOrders,
  getRevenueBySource,
  getRevenueOverTime,
  getSummary,
} from "@/lib/queries";
import { StatTiles } from "./_components/StatTiles";
import { RevenueBySourceChart } from "./_components/RevenueBySourceChart";
import { RevenueOverTimeChart } from "./_components/RevenueOverTimeChart";
import { Filters } from "./_components/Filters";
import { OrdersTable } from "./_components/OrdersTable";
import { SignOutButton } from "./_components/SignOutButton";

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; utmSource?: string }>;
}) {
  const params = await searchParams;
  const from = params.from || defaultFrom();
  const to = params.to || todayIso();
  const utmSource = params.utmSource || "";

  const filters = {
    from: new Date(`${from}T00:00:00.000Z`),
    to: new Date(`${to}T23:59:59.999Z`),
    utmSource: utmSource || undefined,
  };

  const [summary, revenueBySource, revenueOverTime, orders, sources] = await Promise.all([
    getSummary(filters),
    getRevenueBySource(filters),
    getRevenueOverTime(filters),
    getOrders(filters),
    getDistinctSources(),
  ]);

  return (
    <div className="viz-root min-h-screen bg-[#0d0d0d] px-6 py-8 text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Painel UTM</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Atribuição de vendas por campanha
            </p>
          </div>
          <SignOutButton />
        </header>

        <Filters from={from} to={to} utmSource={utmSource} sources={sources} />

        <StatTiles
          totalRevenue={summary.totalRevenue}
          orderCount={summary.orderCount}
          averageTicket={summary.averageTicket}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-white/10 bg-[var(--chart-surface)] p-4">
            <h2 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
              Receita por fonte (utm_source)
            </h2>
            <RevenueBySourceChart data={revenueBySource} />
          </section>

          <section className="rounded-xl border border-white/10 bg-[var(--chart-surface)] p-4">
            <h2 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
              Receita ao longo do tempo
            </h2>
            <RevenueOverTimeChart data={revenueOverTime} />
          </section>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">Pedidos</h2>
          <OrdersTable orders={orders} />
        </section>
      </div>
    </div>
  );
}
