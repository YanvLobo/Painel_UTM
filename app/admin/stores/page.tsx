import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createStore, deleteStore } from "./actions";

export default async function AdminStoresPage() {
  const session = await auth();
  if (session?.user.role !== "AGENCY_ADMIN") redirect("/dashboard");

  const stores = await prisma.store.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { orders: true, users: true } } },
  });

  return (
    <div className="viz-root min-h-screen bg-[#0d0d0d] px-6 py-8 text-[var(--text-primary)]">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Lojas</h1>
            <p className="text-sm text-[var(--text-secondary)]">Gerencie as lojas dos clientes</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Voltar ao painel
          </Link>
        </header>

        <section className="rounded-xl border border-white/10 bg-[var(--chart-surface)] p-4">
          <h2 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">Cadastrar loja</h2>
          <form action={createStore} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--text-secondary)]">Nome do cliente/loja</label>
              <input
                name="name"
                required
                placeholder="Ex: Loja do João"
                className="rounded-md border border-white/10 bg-transparent px-2 py-1.5 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--text-secondary)]">Domínio Shopify</label>
              <input
                name="shopifyDomain"
                required
                placeholder="loja.myshopify.com"
                className="rounded-md border border-white/10 bg-transparent px-2 py-1.5 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-[var(--text-secondary)]">
                Webhook secret (Client secret do app Shopify dessa loja)
              </label>
              <input
                name="webhookSecret"
                required
                placeholder="shpss_..."
                className="rounded-md border border-white/10 bg-transparent px-2 py-1.5 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--text-secondary)]">
                Email do cliente (opcional, cria login)
              </label>
              <input
                name="clientEmail"
                type="email"
                placeholder="cliente@exemplo.com"
                className="rounded-md border border-white/10 bg-transparent px-2 py-1.5 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--text-secondary)]">Senha do cliente</label>
              <input
                name="clientPassword"
                type="text"
                placeholder="senha-forte"
                className="rounded-md border border-white/10 bg-transparent px-2 py-1.5 text-sm"
              />
            </div>

            <button
              type="submit"
              className="sm:col-span-2 rounded-md bg-[var(--series-1)] px-4 py-1.5 text-sm font-medium text-white"
            >
              Cadastrar
            </button>
          </form>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">Lojas cadastradas</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[var(--chart-surface)]">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[var(--text-muted)]">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Domínio</th>
                  <th className="px-4 py-3 font-medium">Pedidos</th>
                  <th className="px-4 py-3 font-medium">Usuários</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2 text-[var(--text-secondary)]">{s.shopifyDomain}</td>
                    <td className="px-4 py-2 text-[var(--text-secondary)]">{s._count.orders}</td>
                    <td className="px-4 py-2 text-[var(--text-secondary)]">{s._count.users}</td>
                    <td className="px-4 py-2 text-right">
                      <form action={deleteStore}>
                        <input type="hidden" name="id" value={s.id} />
                        <button type="submit" className="text-xs text-red-400 hover:text-red-300">
                          Remover
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {stores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-[var(--text-secondary)]">
                      Nenhuma loja cadastrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
