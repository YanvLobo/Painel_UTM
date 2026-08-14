export function Filters({
  from,
  to,
  utmSource,
  sources,
  storeId,
}: {
  from: string;
  to: string;
  utmSource: string;
  sources: string[];
  storeId?: string;
}) {
  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-[var(--chart-surface)] p-4"
      method="get"
    >
      {storeId && <input type="hidden" name="storeId" value={storeId} />}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--text-secondary)]" htmlFor="from">
          De
        </label>
        <input
          id="from"
          name="from"
          type="date"
          defaultValue={from}
          className="rounded-md border border-white/10 bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--text-secondary)]" htmlFor="to">
          Até
        </label>
        <input
          id="to"
          name="to"
          type="date"
          defaultValue={to}
          className="rounded-md border border-white/10 bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--text-secondary)]" htmlFor="utmSource">
          Fonte (utm_source)
        </label>
        <select
          id="utmSource"
          name="utmSource"
          defaultValue={utmSource}
          className="rounded-md border border-white/10 bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)]"
        >
          <option value="">Todas</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded-md bg-[var(--series-1)] px-4 py-1.5 text-sm font-medium text-white"
      >
        Filtrar
      </button>
    </form>
  );
}
