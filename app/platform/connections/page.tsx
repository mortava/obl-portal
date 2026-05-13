"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plug, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { SAMPLE_CONNECTION_HEALTH } from "@/lib/platform-samples";
import { cls, timeAgo } from "@/lib/utils";
import type { ConnectionHealth } from "@/lib/platform-types";

type StatusFilter = "all" | ConnectionHealth["status"];
type ServiceFilter = "all" | ConnectionHealth["service"];

const STATUS_CHIP: Record<ConnectionHealth["status"], string> = {
  ok: "chip-green",
  degraded: "chip-amber",
  down: "chip-red",
  not_connected: "chip-gray",
};

export default function PlatformConnectionsPage() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [service, setService] = useState<ServiceFilter>("all");

  const rows = useMemo(() => {
    return SAMPLE_CONNECTION_HEALTH.filter(
      (c) => (status === "all" || c.status === status) && (service === "all" || c.service === service)
    );
  }, [status, service]);

  const stats = useMemo(() => {
    return {
      ok: SAMPLE_CONNECTION_HEALTH.filter((c) => c.status === "ok").length,
      degraded: SAMPLE_CONNECTION_HEALTH.filter((c) => c.status === "degraded").length,
      down: SAMPLE_CONNECTION_HEALTH.filter((c) => c.status === "down").length,
      missing: SAMPLE_CONNECTION_HEALTH.filter((c) => c.status === "not_connected").length,
    };
  }, []);

  return (
    <PlatformShell
      title="Connections"
      subtitle="Cross-tenant health of Encompass, Anthropic, Slack, and email integrations"
    >
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Healthy" value={String(stats.ok)} tone="green" />
          <Stat label="Degraded" value={String(stats.degraded)} tone="amber" />
          <Stat label="Down" value={String(stats.down)} tone="red" />
          <Stat label="Not connected" value={String(stats.missing)} tone="neutral" />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs">
            {(["all", "ok", "degraded", "down", "not_connected"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cls(
                  "px-3 h-8 rounded-lg font-medium transition-colors",
                  status === s
                    ? "bg-ink-900 text-white"
                    : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"
                )}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {(["all", "encompass", "anthropic", "slack", "email"] as ServiceFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setService(s)}
                className={cls(
                  "px-3 h-8 rounded-lg font-medium transition-colors capitalize",
                  service === s
                    ? "bg-ink-900 text-white"
                    : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs text-ink-500">
              <tr>
                <th className="text-left font-medium px-4 py-2 w-px">Service</th>
                <th className="text-left font-medium px-4 py-2">Tenant</th>
                <th className="text-left font-medium px-4 py-2">Env</th>
                <th className="text-left font-medium px-4 py-2">Status</th>
                <th className="text-right font-medium px-4 py-2">Latency</th>
                <th className="text-left font-medium px-4 py-2">Last check</th>
                <th className="w-px"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={`${c.tenantId}:${c.service}:${c.env}`} className="border-t border-ink-200 hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Plug className="w-4 h-4 text-ink-400" />
                      <span className="text-ink-900 font-medium capitalize">{c.service}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/platform/tenants/${c.tenantId}`} className="text-sm text-ink-700 hover:underline">
                      {c.tenantName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600">{c.env}</td>
                  <td className="px-4 py-3">
                    <span className={STATUS_CHIP[c.status]}>{c.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums">
                    {c.latencyMs ? `${c.latencyMs}ms` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{timeAgo(c.lastCheckAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost h-7 px-2 text-xs">
                      <RefreshCw className="w-3 h-3" />
                      Re-test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div className="text-xs text-ink-700">
            <strong className="text-ink-900">Production probe is live.</strong> The Encompass adapter is reachable
            end-to-end via <code className="text-[11px] bg-ink-100 px-1 rounded">supabase/functions/encompass-test</code>{" "}
            and exchanges real OAuth tokens against <code className="text-[11px] bg-ink-100 px-1 rounded">api.elliemae.com</code>.
            See <Link href="/connections" className="text-brand-700 hover:underline">user-panel connections</Link> for the test UI.
          </div>
        </div>

        {rows.some((r) => r.status === "down" || r.status === "degraded") && (
          <div className="card p-5 flex items-start gap-3 border-amber-200 bg-amber-50/40">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-xs text-ink-700">
              <strong className="text-ink-900">Some tenants need attention.</strong> Re-test affected connections from the rows above,
              or escalate to the tenant's primary contact from the tenant detail page.
            </div>
          </div>
        )}
      </div>
    </PlatformShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "green" | "amber" | "red" | "neutral" }) {
  const TONE: Record<string, string> = {
    green: "text-emerald-700 bg-emerald-50",
    amber: "text-amber-700 bg-amber-50",
    red: "text-red-700 bg-red-50",
    neutral: "text-ink-700 bg-ink-100",
  };
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>{label}</span>
        <span className={cls("w-6 h-6 rounded-md", TONE[tone])} />
      </div>
      <div className="text-2xl font-semibold text-ink-900 mt-1">{value}</div>
    </div>
  );
}
