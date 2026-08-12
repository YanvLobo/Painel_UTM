function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function StatTiles({
  totalRevenue,
  orderCount,
  averageTicket,
}: {
  totalRevenue: number;
  orderCount: number;
  averageTicket: number;
}) {
  const tiles = [
    { label: "Receita total", value: formatCurrency(totalRevenue) },
    { label: "Pedidos", value: orderCount.toLocaleString("pt-BR") },
    { label: "Ticket médio", value: formatCurrency(averageTicket) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl border border-white/10 bg-[var(--chart-surface)] p-5"
        >
          <p className="text-sm text-[var(--text-secondary)]">{tile.label}</p>
          <p
            className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tile.value}
          </p>
        </div>
      ))}
    </div>
  );
}
