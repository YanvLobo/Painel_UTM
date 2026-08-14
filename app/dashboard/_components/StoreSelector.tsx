"use client";

import { useRouter } from "next/navigation";

type Store = { id: string; name: string };

export function StoreSelector({
  stores,
  selectedStoreId,
}: {
  stores: Store[];
  selectedStoreId: string;
}) {
  const router = useRouter();

  return (
    <select
      value={selectedStoreId}
      onChange={(e) => router.push(`/dashboard?storeId=${e.target.value}`)}
      className="rounded-md border border-white/10 bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)]"
    >
      {stores.map((s) => (
        <option key={s.id} value={s.id} className="bg-[#0d0d0d]">
          {s.name}
        </option>
      ))}
    </select>
  );
}
