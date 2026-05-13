"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, AlertTriangle, CheckCircle2, ShieldX } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { SAMPLE_AUDIT } from "@/lib/platform-samples";
import { cls, timeAgo } from "@/lib/utils";
import type { AuditEntry } from "@/lib/platform-types";

type SeverityFilter = "all" | AuditEntry["severity"];

const SEVERITY_ICON: Record<AuditEntry["severity"], React.ReactNode> = {
  info: <CheckCircle2 className="w-4 h-4 text-ink-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  blocked: <ShieldX className="w-4 h-4 text-red-600" />,
};

const SEVERITY_CHIP: Record<AuditEntry["severity"], string> = {
  info: "chip-gray",
  warning: "chip-amber",
  blocked: "chip-red",
};

export default function PlatformAuditPage() {
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return SAMPLE_AUDIT.filter((e) => {
      if (severity !== "all" && e.severity !== severity) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        e.summary.toLowerCase().includes(s) ||
        e.actor.toLowerCase().includes(s) ||
        (e.tenantName ?? "").toLowerCase().includes(s) ||
        e.action.toLowerCase().includes(s)
      );
    });
  }, [severity, q]);

  return (
    <PlatformShell
      title="Audit log"
      subtitle="Every operator and runtime action across all tenants"
    >
      <div className="max-w-7xl mx-auto p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs">
            {(["all", "info", "warning", "blocked"] as SeverityFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={cls(
                  "px-3 h-8 rounded-lg font-medium transition-colors capitalize",
                  severity === s
                    ? "bg-ink-900 text-white"
                    : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search action, actor, summary, tenant…"
              className="input pl-8 h-9"
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs text-ink-500">
              <tr>
                <th className="w-px"></th>
                <th className="text-left font-medium px-4 py-2">Action</th>
                <th className="text-left font-medium px-4 py-2">Summary</th>
                <th className="text-left font-medium px-4 py-2">Tenant</th>
                <th className="text-left font-medium px-4 py-2">Actor</th>
                <th className="text-left font-medium px-4 py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-ink-200 hover:bg-ink-50">
                  <td className="px-3 py-3">{SEVERITY_ICON[e.severity]}</td>
                  <td className="px-4 py-3">
                    <code className="text-[11px] text-ink-700 bg-ink-100 px-1.5 py-0.5 rounded">
                      {e.action}
                    </code>
                    <div className="mt-1">
                      <span className={SEVERITY_CHIP[e.severity]}>{e.severity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-900">{e.summary}</td>
                  <td className="px-4 py-3">
                    {e.tenantId ? (
                      <Link
                        href={`/platform/tenants/${e.tenantId}`}
                        className="text-sm text-ink-700 hover:underline"
                      >
                        {e.tenantName}
                      </Link>
                    ) : (
                      <span className="text-xs text-ink-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-700">{e.actor}</td>
                  <td className="px-4 py-3 text-xs text-ink-500">{timeAgo(e.at)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">
                    No audit entries match.
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
