"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import {
  SAMPLE_TENANTS,
  SAMPLE_PLATFORM_USERS,
  SAMPLE_PLATFORM_WORKFLOWS,
  SAMPLE_ALERTS,
  SAMPLE_POLICIES,
  SAMPLE_AUDIT,
} from "@/lib/platform-samples";
import { cls } from "@/lib/utils";
import { fmtNum, fmtPct, timeAgo } from "@/lib/utils";

export default function PlatformOverviewPage() {
  const tenants = SAMPLE_TENANTS;
  const users = SAMPLE_PLATFORM_USERS;
  const workflows = SAMPLE_PLATFORM_WORKFLOWS;
  const openAlerts = SAMPLE_ALERTS.filter((a) => !a.acknowledged);
  const policies = SAMPLE_POLICIES;
  const audit = SAMPLE_AUDIT.slice(0, 6);

  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const trialTenants = tenants.filter((t) => t.status === "trial").length;
  const totalRuns24h = workflows.reduce((sum, w) => sum + w.runs24h, 0);
  const liveWorkflows = workflows.filter((w) => w.status === "live").length;
  const weightedSuccess =
    workflows.reduce((sum, w) => sum + w.successRate * w.runs24h, 0) /
    Math.max(1, totalRuns24h);

  return (
    <PlatformShell
      title="Platform overview"
      subtitle="Aggregate health and activity across all OpenBroker tenants"
      alertCount={openAlerts.length}
    >
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Building2 className="w-4 h-4" />}
            label="Active tenants"
            value={String(activeTenants)}
            hint={`${trialTenants} in trial`}
            accent="brand"
          />
          <KpiCard
            icon={<Users className="w-4 h-4" />}
            label="Users"
            value={fmtNum(users.length)}
            hint="across all tenants"
            accent="ink"
          />
          <KpiCard
            icon={<Activity className="w-4 h-4" />}
            label="Runs (24h)"
            value={fmtNum(totalRuns24h)}
            hint={`${liveWorkflows} live workflows`}
            accent="emerald"
          />
          <KpiCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Success rate"
            value={fmtPct(weightedSuccess)}
            hint="weighted by run volume"
            accent={weightedSuccess >= 0.9 ? "emerald" : "amber"}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Tenant activity</h3>
                <p className="text-xs text-ink-500">Top tenants by 24-hour run volume</p>
              </div>
              <Link href="/platform/tenants" className="text-xs text-brand-700 hover:underline">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {[...tenants]
                .sort((a, b) => b.runs24h - a.runs24h)
                .slice(0, 5)
                .map((t) => {
                  const pct = Math.round((t.monthlyRunsUsed / t.monthlyRunBudget) * 100);
                  return (
                    <Link
                      key={t.id}
                      href={`/platform/tenants/${t.id}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-ink-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink-900 truncate">{t.name}</div>
                        <div className="text-xs text-ink-500 flex items-center gap-2">
                          <PlanBadge plan={t.plan} />
                          <StatusBadge status={t.status} />
                          <span>·</span>
                          <span>{t.workflowsLive} workflows live</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-ink-900">{fmtNum(t.runs24h)}</div>
                        <div className="text-xs text-ink-500">runs / 24h</div>
                      </div>
                      <div className="hidden sm:block w-24 shrink-0">
                        <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                          <div
                            className={cls(
                              "h-full",
                              pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-ink-500 mt-1">
                          {pct}% of monthly budget
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Open alerts</h3>
                <p className="text-xs text-ink-500">{openAlerts.length} unacknowledged</p>
              </div>
              <Link href="/platform/alerts" className="text-xs text-brand-700 hover:underline">
                View all →
              </Link>
            </div>
            {openAlerts.length === 0 ? (
              <div className="text-xs text-ink-500 py-6 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                Nothing on fire.
              </div>
            ) : (
              <div className="space-y-2">
                {openAlerts.slice(0, 4).map((a) => (
                  <div key={a.id} className="rounded-lg border border-ink-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityDot severity={a.severity} />
                      <div className="text-sm font-medium text-ink-900 truncate">{a.title}</div>
                    </div>
                    <p className="text-xs text-ink-500 line-clamp-2">{a.detail}</p>
                    <div className="text-[10px] text-ink-400 mt-1">{timeAgo(a.at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Policy enforcement</h3>
                <p className="text-xs text-ink-500">Critical guardrails</p>
              </div>
              <Link href="/platform/policies" className="text-xs text-brand-700 hover:underline">
                Details →
              </Link>
            </div>
            <div className="space-y-2">
              {policies.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-lg p-2">
                  <ShieldCheck
                    className={cls(
                      "w-4 h-4 shrink-0",
                      p.enforced ? "text-emerald-600" : "text-amber-600"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink-900 truncate">{p.name}</div>
                    <div className="text-xs text-ink-500">
                      {p.enforced ? "Enforced" : "Not enforced"} · {p.blocked24h} blocked / 24h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Recent activity</h3>
                <p className="text-xs text-ink-500">Latest audit events across tenants</p>
              </div>
              <Link href="/platform/audit" className="text-xs text-brand-700 hover:underline">
                View log →
              </Link>
            </div>
            <ul className="space-y-2">
              {audit.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 rounded-lg p-2">
                  <div className="mt-0.5">
                    {entry.severity === "blocked" ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : entry.severity === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-ink-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink-900">{entry.summary}</div>
                    <div className="text-xs text-ink-500">
                      {entry.tenantName ? `${entry.tenantName} · ` : ""}
                      {entry.actor} · {timeAgo(entry.at)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent: "brand" | "ink" | "emerald" | "amber" | "red";
}) {
  const ACCENT: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    ink: "bg-ink-100 text-ink-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-500">{label}</span>
        <span className={cls("w-7 h-7 rounded-lg grid place-items-center", ACCENT[accent])}>
          {icon}
        </span>
      </div>
      <div className="text-2xl font-semibold text-ink-900 mt-2">{value}</div>
      {hint && <div className="text-[11px] text-ink-500 mt-0.5">{hint}</div>}
    </div>
  );
}

function PlanBadge({ plan }: { plan: "starter" | "growth" | "enterprise" }) {
  const map: Record<string, string> = {
    starter: "bg-ink-100 text-ink-700",
    growth: "bg-brand-50 text-brand-700",
    enterprise: "bg-violet-50 text-violet-700",
  };
  return (
    <span className={cls("px-1.5 h-4 rounded text-[10px] font-medium inline-flex items-center", map[plan])}>
      {plan}
    </span>
  );
}

function StatusBadge({ status }: { status: "active" | "trial" | "suspended" }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    trial: "bg-amber-50 text-amber-700",
    suspended: "bg-red-50 text-red-700",
  };
  return (
    <span className={cls("px-1.5 h-4 rounded text-[10px] font-medium inline-flex items-center", map[status])}>
      {status}
    </span>
  );
}

function SeverityDot({ severity }: { severity: "info" | "warning" | "critical" }) {
  const map: Record<string, string> = {
    info: "bg-ink-400",
    warning: "bg-amber-500",
    critical: "bg-red-500",
  };
  return <span className={cls("w-2 h-2 rounded-full shrink-0", map[severity])} />;
}
