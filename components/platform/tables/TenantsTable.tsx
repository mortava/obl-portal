"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import type { Tenant } from "@/lib/platform-types";
import { cls, fmtNum, fmtPct, timeAgo } from "@/lib/utils";

type Filter = "all" | "active" | "trial" | "suspended";

export function TenantsTable({ tenants: all }: { tenants: Tenant[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const tenants = useMemo(() => {
    return all.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return t.name.toLowerCase().includes(s) || t.slug.includes(s);
    });
  }, [all, filter, q]);

  const counts = useMemo(
    () => ({
      all: all.length,
      active: all.filter((t) => t.status === "active").length,
      trial: all.filter((t) => t.status === "trial").length,
      suspended: all.filter((t) => t.status === "suspended").length,
    }),
    [all]
  );

  return (
    <PlatformShell
      title="Tenants"
      subtitle="All lender organizations on OpenBroker"
      action={
        <button className="btn-primary h-9 px-3">
          <Plus className="w-4 h-4" />
          New tenant
        </button>
      }
    >
      <div className="max-w-7xl mx-auto p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs">
            {(["all", "active", "trial", "suspended"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cls(
                  "px-3 h-8 rounded-lg font-medium transition-colors",
                  filter === f
                    ? "bg-ink-900 text-white"
                    : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 text-ink-400">{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tenants…"
              className="input pl-8 h-9"
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs text-ink-500">
              <tr>
                <th className="text-left font-medium px-4 py-2">Tenant</th>
                <th className="text-left font-medium px-4 py-2">Plan</th>
                <th className="text-left font-medium px-4 py-2">Status</th>
                <th className="text-left font-medium px-4 py-2">Env</th>
                <th className="text-right font-medium px-4 py-2">Live</th>
                <th className="text-right font-medium px-4 py-2">Runs / 24h</th>
                <th className="text-right font-medium px-4 py-2">Success</th>
                <th className="text-right font-medium px-4 py-2">Budget used</th>
                <th className="text-left font-medium px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => {
                const pct = Math.round((t.monthlyRunsUsed / t.monthlyRunBudget) * 100);
                return (
                  <tr
                    key={t.id}
                    className="border-t border-ink-200 hover:bg-ink-50 cursor-pointer"
                    onClick={() => (window.location.href = `/platform/tenants/${t.id}`)}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/platform/tenants/${t.id}`}
                        className="flex items-center gap-2 text-ink-900 font-medium hover:underline"
                      >
                        <Building2 className="w-4 h-4 text-ink-400" />
                        {t.name}
                      </Link>
                      <div className="text-xs text-ink-500 ml-6">{t.primaryContact}</div>
                    </td>
                    <td className="px-4 py-3"><PlanChip plan={t.plan} /></td>
                    <td className="px-4 py-3"><StatusChip status={t.status} /></td>
                    <td className="px-4 py-3 text-xs text-ink-600">{t.env}</td>
                    <td className="px-4 py-3 text-right">{t.workflowsLive}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmtNum(t.runs24h)}</td>
                    <td className="px-4 py-3 text-right">{fmtPct(t.successRate)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-xs font-medium">{pct}%</div>
                      <div className="text-[10px] text-ink-500">
                        {fmtNum(t.monthlyRunsUsed)} / {fmtNum(t.monthlyRunBudget)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500">{timeAgo(t.createdAt)}</td>
                  </tr>
                );
              })}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink-500">
                    No tenants match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PlatformShell>
  );
}

function PlanChip({ plan }: { plan: "starter" | "growth" | "enterprise" }) {
  const map: Record<string, string> = {
    starter: "chip-gray",
    growth: "chip-brand",
    enterprise: "chip-ai",
  };
  return <span className={map[plan]}>{plan}</span>;
}

function StatusChip({ status }: { status: "active" | "trial" | "suspended" }) {
  const map: Record<string, string> = {
    active: "chip-green",
    trial: "chip-amber",
    suspended: "chip-red",
  };
  return <span className={map[status]}>{status}</span>;
}
