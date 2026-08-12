"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function RevenueBySourceChart({
  data,
}: {
  data: { source: string; revenue: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="p-6 text-sm text-[var(--text-secondary)]">
        Sem pedidos com UTM no período selecionado.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 24 }}>
        <CartesianGrid horizontal={false} stroke="var(--gridline)" />
        <XAxis
          type="number"
          tickFormatter={formatCurrency}
          stroke="var(--baseline)"
          tick={{ fill: "var(--text-muted)", fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="source"
          width={120}
          stroke="var(--baseline)"
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            background: "var(--chart-surface)",
            border: "1px solid var(--gridline)",
            color: "var(--text-primary)",
          }}
          labelStyle={{ color: "var(--text-secondary)" }}
        />
        <Bar dataKey="revenue" fill="var(--series-1)" radius={[0, 4, 4, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
