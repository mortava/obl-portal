"use client";

import { Search, AlertTriangle } from "lucide-react";
import { UserMenu } from "../UserMenu";

interface PlatformTopbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  alertCount?: number;
}

export function PlatformTopbar({
  title,
  subtitle,
  action,
  alertCount = 0,
}: PlatformTopbarProps) {
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
          <input placeholder="Search tenants, users, runs…" className="input pl-8" />
        </div>
      </div>
      {alertCount > 0 && (
        <div
          className="hidden md:flex items-center gap-1.5 text-[11px] rounded-full px-2.5 h-7"
          style={{
            background: "var(--interactive-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <AlertTriangle className="w-3 h-3" />
          {alertCount} open alert{alertCount === 1 ? "" : "s"}
        </div>
      )}
      {action}
      <UserMenu />
    </header>
  );
}
