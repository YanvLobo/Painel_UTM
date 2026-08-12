type OrderRow = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  totalPrice: number;
  currency: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrer: string | null;
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

const columns: { key: keyof OrderRow; label: string }[] = [
  { key: "orderNumber", label: "Pedido" },
  { key: "createdAt", label: "Data" },
  { key: "totalPrice", label: "Valor" },
  { key: "utmSource", label: "Source" },
  { key: "utmMedium", label: "Medium" },
  { key: "utmCampaign", label: "Campaign" },
  { key: "utmTerm", label: "Term" },
  { key: "utmContent", label: "Content" },
  { key: "referrer", label: "From" },
];

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[var(--chart-surface)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[var(--text-muted)]">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-white/5 last:border-0">
              <td className="px-4 py-2 text-[var(--text-primary)]">#{order.orderNumber}</td>
              <td className="px-4 py-2 text-[var(--text-secondary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-2 text-[var(--text-primary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(order.totalPrice, order.currency)}
              </td>
              <td className="px-4 py-2 text-[var(--text-secondary)]">{order.utmSource ?? "—"}</td>
              <td className="px-4 py-2 text-[var(--text-secondary)]">{order.utmMedium ?? "—"}</td>
              <td className="px-4 py-2 text-[var(--text-secondary)]">{order.utmCampaign ?? "—"}</td>
              <td className="px-4 py-2 text-[var(--text-secondary)]">{order.utmTerm ?? "—"}</td>
              <td className="px-4 py-2 text-[var(--text-secondary)]">{order.utmContent ?? "—"}</td>
              <td className="px-4 py-2 text-[var(--text-secondary)]">{order.referrer ?? "—"}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-[var(--text-secondary)]">
                Nenhum pedido no período selecionado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
