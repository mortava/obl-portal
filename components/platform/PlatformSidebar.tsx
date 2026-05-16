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
    <aside
      className="hidden md:flex md:flex-col w-60 shrink-0"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="h-14 px-5 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="w-6 h-6 rounded grid place-items-center text-[10px] font-medium"
          style={{ background: "var(--interactive-primary)", color: "#fff" }}
        >
          OB
        </div>
        <div className="leading-tight">
          <div className="text-[13px]" style={{ color: "var(--text-primary)" }}>
            OpenBroker
          </div>
          <div className="mono-caps" style={{ fontSize: 9 }}>
            Platform console
          </div>
        </div>
      </div>
      <nav className="p-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cls(
                "flex items-center gap-3 rounded-md px-3 py-1.5 text-[13px] transition-colors"
              )}
              style={{
                background: active ? "var(--interactive-secondary)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3 space-y-2">
        <div
          className="rounded-lg p-3 text-xs"
          style={{
            background: "var(--interactive-secondary)",
            color: "var(--text-secondary)",
          }}
        >
          <div className="mono-caps mb-1" style={{ fontSize: 9 }}>
            Operator mode
          </div>
          Viewing platform-wide data across all tenants.
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors hover:bg-[var(--interactive-secondary)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to user panel
        </Link>
      </div>
    </aside>
  );
}
