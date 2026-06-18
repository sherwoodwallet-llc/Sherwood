"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AppHeader({ subtitle }: { subtitle: string }) {
  const { user, profile, isMaster, signOutUser } = useAuth();
  const label = isMaster
    ? "Master"
    : profile?.name || user?.email || "Manager";

  return (
    <header className="flex flex-col justify-between gap-5 rounded-3xl border border-line bg-ink/70 p-6 sm:flex-row sm:items-center">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">
          Sherwood internal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Sherwood Connect
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-cream-muted">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-cream">{label}</p>
          <p className="text-xs text-cream-muted">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOutUser()}
          className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-line text-cream-muted transition-colors hover:text-cream"
          aria-label="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
