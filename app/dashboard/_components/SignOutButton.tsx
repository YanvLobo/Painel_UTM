"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    >
      Sair
    </button>
  );
}
