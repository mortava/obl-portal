"use client";

import { Search, AlertTriangle } from "lucide-react";
import { UserMenu } from "../UserMenu";

interface PlatformTopbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  alertCount?: number;
}

export function PlatformTopbar({ title, subtitle, action, alertCount = 0 }: PlatformTopbarProps) {
  return (
    <header className="h-14 shrink-0 border-b border-ink-200 bg-white flex items-center px-6 gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-ink-900 truncate">{title}</div>
        {subtitle && <div className="text-xs text-ink-500 truncate">{subtitle}</div>}
      </div>
      <div className="hidden md:flex items-center gap-2 max-w-sm flex-1">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            placeholder="Search tenants, users, runs…"
            className="input pl-8 h-9"
          />
        </div>
      </div>
      {alertCount > 0 && (
        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 h-7">
          <AlertTriangle className="w-3.5 h-3.5" />
          {alertCount} open alert{alertCount === 1 ? "" : "s"}
        </div>
      )}
      {action}
      <UserMenu />
    </header>
  );
}
