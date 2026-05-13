"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { SAMPLE_PLATFORM_WORKFLOWS, SAMPLE_TENANTS } from "@/lib/platform-samples";
import { cls, fmtNum, fmtPct, timeAgo } from "@/lib/utils";

const STATUS_CHIP: Record<string, string> = {
  live: "chip-green",
  paused: "chip-amber",
  draft: "chip-gray",
  error: "chip-red",
};

function WorkflowsTable() {
  const params = useSearchParams();
  const tenantFilter = params?.get("tenant") ?? "all";
  const [status, setStatus] = useState<"all" | "live" | "paused" | "draft" | "error">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return SAMPLE_PLATFORM_WORKFLOWS.filter((w) => {
      if (tenantFilter !== "all" && w.tenantId !== tenantFilter) return false;
      if (status !== "all" && w.status !== status) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return w.name.toLowerCase().includes(s) || w.tenantName.toLowerCase().includes(s);
    });
  }, [tenantFilter, status, q]);

  const tenantName =
    tenantFilter === "all"
      ? null
      : SAMPLE_TENANTS.find((t) => t.id === tenantFilter)?.name ?? tenantFilter;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-4">
      {tenantName && (
        <div className="text-xs text-ink-600 flex items-center gap-2">
          Filtered to <strong className="text-ink-900">{tenantName}</strong>
          <Link href="/platform/workflows" className="text-brand-700 hover:underline">
            clear
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs">
          {(["all", "live", "paused", "draft", "error"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cls(
                "px-3 h-8 rounded-lg font-medium transition-colors capitalize",
                status === s
                  ? "bg-ink-900 text-white"
                  : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search workflows…"
            className="input pl-8 h-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs text-ink-500">
            <tr>
              <th className="text-left font-medium px-4 py-2">Workflow</th>
              <th className="text-left font-medium px-4 py-2">Tenant</th>
              <th className="text-left font-medium px-4 py-2">Status</th>
              <th className="text-left font-medium px-4 py-2">Env</th>
              <th className="text-right font-medium px-4 py-2">Runs / 24h</th>
              <th className="text-right font-medium px-4 py-2">Success</th>
              <th className="text-left font-medium px-4 py-2">Last run</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={`${w.tenantId}:${w.id}`} className="border-t border-ink-200 hover:bg-ink-50">
                <td className="px-4 py-3 text-ink-900 font-medium">{w.name}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/platform/tenants/${w.tenantId}`}
                    className="text-sm text-ink-700 hover:underline"
                  >
                    {w.tenantName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={STATUS_CHIP[w.status]}>{w.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-ink-600">{w.env}</td>
                <td className="px-4 py-3 text-right font-medium">{fmtNum(w.runs24h)}</td>
                <td className="px-4 py-3 text-right">{fmtPct(w.successRate)}</td>
                <td className="px-4 py-3 text-xs text-ink-500">{timeAgo(w.lastRunAt)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-500">
                  No workflows match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PlatformWorkflowsPage() {
  return (
    <PlatformShell
      title="Workflows"
      subtitle="All workflows across every tenant on OpenBroker"
    >
      <Suspense fallback={<div className="p-8 text-sm text-ink-500">Loading…</div>}>
        <WorkflowsTable />
      </Suspense>
    </PlatformShell>
  );
}
