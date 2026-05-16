"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { UserMenu } from "./UserMenu";

export function Topbar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header
      className="h-14 shrink-0 flex items-center px-6 gap-4"
      style={{
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[15px] truncate" style={{ color: "var(--text-primary)" }}>
          {title}
        </div>
        {subtitle && (
          <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="hidden md:flex items-center gap-2 max-w-sm flex-1">
        <div className="relative w-full">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: "var(--text-muted)" }}
          />
          <input placeholder="Search workflows, runs, loans…" className="input pl-8" />
        </div>
      </div>
      {action ?? (
        <Link href="/new" className="btn-primary">
          <Plus className="w-3.5 h-3.5" />
          New workflow
        </Link>
      )}
      <UserMenu />
    </header>
  );
}
