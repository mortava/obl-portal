"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Workflow,
  Activity,
  Plug,
  LayoutGrid,
  Settings,
  ShieldCheck,
  Building2,
  BookOpen,
} from "lucide-react";
import { cls } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Workflows", icon: Workflow },
  { href: "/runs", label: "Runs", icon: Activity },
  { href: "/connections", label: "Connections", icon: Plug },
  { href: "/templates", label: "Templates", icon: LayoutGrid },
  { href: "/help", label: "Guides", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
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
            AI workflow portal
          </div>
        </div>
      </div>
      <nav className="p-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
        <Link
          href="/platform"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors"
          style={{
            background: "var(--interactive-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Building2 className="w-3.5 h-3.5" />
          Platform console
        </Link>
        <div
          className="rounded-lg p-3 text-xs"
          style={{
            background: "var(--interactive-secondary)",
            color: "var(--text-secondary)",
          }}
        >
          <div className="flex items-center gap-1.5 mono-caps mb-1" style={{ fontSize: 9 }}>
            <ShieldCheck className="w-3 h-3" />
            No-deletion guardrail
          </div>
          The platform will never delete data in Encompass. Enforced at every layer.
        </div>
      </div>
    </aside>
  );
}
