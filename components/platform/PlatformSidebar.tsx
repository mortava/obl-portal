"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Workflow,
  Activity,
  Plug,
  ShieldCheck,
  ScrollText,
  BellRing,
  Settings,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { cls } from "@/lib/utils";

const NAV = [
  { href: "/platform", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/platform/tenants", label: "Tenants", icon: Building2 },
  { href: "/platform/users", label: "Users", icon: Users },
  { href: "/platform/workflows", label: "Workflows", icon: Workflow },
  { href: "/platform/runs", label: "Runs", icon: Activity },
  { href: "/platform/connections", label: "Connections", icon: Plug },
  { href: "/platform/policies", label: "Policies", icon: ShieldCheck },
  { href: "/platform/alerts", label: "Alerts", icon: BellRing },
  { href: "/platform/audit", label: "Audit log", icon: ScrollText },
  { href: "/platform/settings", label: "Settings", icon: Settings },
];

export function PlatformSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-ink-200 bg-ink-900 text-ink-100">
      <div className="h-14 px-5 flex items-center gap-2 border-b border-ink-800">
        <div className="w-7 h-7 rounded-lg bg-white text-ink-900 grid place-items-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">OpenBroker</div>
          <div className="text-[11px] text-ink-400">Platform console</div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cls(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-white text-ink-900"
                  : "text-ink-200 hover:bg-ink-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3 space-y-2">
        <div className="rounded-xl border border-ink-700 bg-ink-800 p-3 text-xs text-ink-200">
          <div className="font-medium text-white mb-1">Operator mode</div>
          You are viewing platform-wide data. Switch to the user panel to act as a single tenant.
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-100 hover:bg-ink-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to user panel
        </Link>
      </div>
    </aside>
  );
}
