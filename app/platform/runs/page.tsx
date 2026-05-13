"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, UserCheck } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { SAMPLE_PLATFORM_WORKFLOWS, SAMPLE_TENANTS } from "@/lib/platform-samples";
import { SAMPLE_RUNS } from "@/lib/samples";
import { cls, fmtDuration, timeAgo } from "@/lib/utils";
import type { Run } from "@/lib/types";

type StatusFilter = "all" | Run["status"];

// Synthesize tenant-attributed runs by mapping the local sample runs across tenants.
const TENANTS_BY_WORKFLOW: Record<string, string> = SAMPLE_PLATFORM_WORKFLOWS.reduce(
  (acc, w) => {
    acc[w.id] = w.tenantId;
    return acc;
  },
  {} as Record<string, string>
);

interface TenantRun extends Run {
  tenantId: string;
  tenantName: string;
}

const PLATFORM_RUNS: TenantRun[] = SAMPLE_RUNS.flatMap((run) => {
  const tenants = SAMPLE_TENANTS.filter((t) => t.status !== "suspended").slice(0, 3);
  return tenants.map((t, i) => ({
    ...run,
    id: `${run.id}-${t.id}`,
    tenantId: t.id,
    tenantName: t.name,
    workflowId: run.workflowId,
    startedAt: new Date(new Date(run.startedAt).getTime() - i * 3600_000).toISOString(),
  }));
});

const STATUS_ICON: Record<Run["status"], React.ReactNode> = {
  succeeded: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  failed: <AlertTriangle className="w-4 h-4 text-red-600" />,
  running: <Clock className="w-4 h-4 text-brand-600 animate-pulse" />,
  awaiting_human: <UserCheck className="w-4 h-4 text-amber-600" />,
};

const STATUS_CHIP: Record<Run["status"], string> = {
  succeeded: "chip-green",
  failed: "chip-red",
  running: "chip-brand",
  awaiting_human: "chip-amber",
};

export default function PlatformRunsPage() {
  const [status, setStatus] = useState<StatusFilter>("all");

  const rows = useMemo(() => {
    return PLATFORM_RUNS.filter((r) => status === "all" || r.status === status).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }, [status]);

  return (
    <PlatformShell
      title="Runs"
      subtitle="All workflow executions across every tenant"
    >
      <div className="max-w-7xl mx-auto p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {(["all", "succeeded", "failed", "running", "awaiting_human"] as StatusFilter[]).map((s) => (
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
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs text-ink-500">
              <tr>
                <th className="text-left font-medium px-4 py-2 w-px">Status</th>
                <th className="text-left font-medium px-4 py-2">Workflow</th>
                <th className="text-left font-medium px-4 py-2">Tenant</th>
                <th className="text-left font-medium px-4 py-2">Loan</th>
                <th className="text-right font-medium px-4 py-2">Duration</th>
                <th className="text-left font-medium px-4 py-2">Started</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-ink-200 hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {STATUS_ICON[r.status]}
                      <span className={STATUS_CHIP[r.status]}>{r.status.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-900 font-medium">{r.workflowName}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/platform/tenants/${r.tenantId}`}
                      className="text-sm text-ink-700 hover:underline"
                    >
                      {r.tenantName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600 font-mono">{r.loanRef ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums">{fmtDuration(r.durationMs)}</td>
                  <td className="px-4 py-3 text-xs text-ink-500">{timeAgo(r.startedAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">
                    No runs match the filter.
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
