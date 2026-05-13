"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  Workflow,
  Plug,
  ShieldCheck,
  Pause,
  PlayCircle,
  ExternalLink,
  Calendar,
  Mail,
} from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import {
  SAMPLE_TENANTS,
  SAMPLE_PLATFORM_USERS,
  SAMPLE_PLATFORM_WORKFLOWS,
  SAMPLE_CONNECTION_HEALTH,
  SAMPLE_AUDIT,
} from "@/lib/platform-samples";
import { cls, fmtNum, fmtPct, timeAgo } from "@/lib/utils";

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const tenant = SAMPLE_TENANTS.find((t) => t.id === params.id);
  if (!tenant) return notFound();

  const users = SAMPLE_PLATFORM_USERS.filter((u) => u.tenantId === tenant.id);
  const workflows = SAMPLE_PLATFORM_WORKFLOWS.filter((w) => w.tenantId === tenant.id);
  const connections = SAMPLE_CONNECTION_HEALTH.filter((c) => c.tenantId === tenant.id);
  const audit = SAMPLE_AUDIT.filter((a) => a.tenantId === tenant.id);

  const budgetPct = Math.round((tenant.monthlyRunsUsed / tenant.monthlyRunBudget) * 100);

  return (
    <PlatformShell
      title={tenant.name}
      subtitle={`Tenant detail · ${tenant.slug}`}
      action={
        tenant.status === "suspended" ? (
          <button className="btn-secondary h-9 px-3">
            <PlayCircle className="w-4 h-4" />
            Reactivate
          </button>
        ) : (
          <button className="btn-secondary h-9 px-3">
            <Pause className="w-4 h-4" />
            Suspend
          </button>
        )
      }
    >
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-900 text-white grid place-items-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink-900">{tenant.name}</h2>
                <div className="text-xs text-ink-500 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {tenant.primaryContact}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created {timeAgo(tenant.createdAt)}
                  </span>
                  <span>{tenant.env}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge label={`plan: ${tenant.plan}`} variant="brand" />
              <Badge label={`status: ${tenant.status}`} variant={tenant.status === "active" ? "green" : tenant.status === "trial" ? "amber" : "red"} />
            </div>
          </div>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Users" value={String(users.length)} icon={<Users className="w-4 h-4" />} />
          <Stat label="Live workflows" value={String(workflows.filter((w) => w.status === "live").length)} icon={<Workflow className="w-4 h-4" />} />
          <Stat label="Runs (24h)" value={fmtNum(workflows.reduce((s, w) => s + w.runs24h, 0))} icon={<Workflow className="w-4 h-4" />} />
          <Stat
            label="Budget used"
            value={`${budgetPct}%`}
            hint={`${fmtNum(tenant.monthlyRunsUsed)} / ${fmtNum(tenant.monthlyRunBudget)}`}
            icon={<Workflow className="w-4 h-4" />}
            tone={budgetPct >= 90 ? "red" : budgetPct >= 70 ? "amber" : "green"}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel
            title="Workflows"
            href={`/platform/workflows?tenant=${tenant.id}`}
            empty="No workflows yet."
          >
            {workflows.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink-900 truncate">{w.name}</div>
                  <div className="text-xs text-ink-500">
                    {w.status} · {w.env} · last run {timeAgo(w.lastRunAt)}
                  </div>
                </div>
                <div className="text-right text-xs text-ink-600">
                  <div className="font-medium">{fmtNum(w.runs24h)} runs</div>
                  <div>{fmtPct(w.successRate)} success</div>
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Users" href="/platform/users" empty="No users.">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-ink-900">{u.name}</div>
                  <div className="text-xs text-ink-500">{u.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-ink-700">{u.role}</div>
                  <div className="text-[11px] text-ink-500">last {timeAgo(u.lastSeen)}</div>
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Connections" href="/platform/connections" empty="No connections.">
            {connections.map((c) => (
              <div key={`${c.service}-${c.env}`} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
                <div className="flex items-center gap-2">
                  <Plug className="w-4 h-4 text-ink-400" />
                  <div>
                    <div className="text-sm font-medium text-ink-900 capitalize">{c.service}</div>
                    <div className="text-xs text-ink-500">{c.env} · last check {timeAgo(c.lastCheckAt)}</div>
                  </div>
                </div>
                <HealthChip status={c.status} latency={c.latencyMs} />
              </div>
            ))}
          </Panel>

          <Panel title="Recent activity" href="/platform/audit" empty="No activity yet.">
            {audit.slice(0, 6).map((a) => (
              <div key={a.id} className="py-2 border-b border-ink-100 last:border-0">
                <div className="text-sm text-ink-900">{a.summary}</div>
                <div className="text-xs text-ink-500">
                  {a.actor} · {timeAgo(a.at)}
                </div>
              </div>
            ))}
          </Panel>
        </section>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Compliance posture
          </h3>
          <p className="text-xs text-ink-600">
            All catalog filters and runtime adapter rules apply to this tenant — including the
            global no-deletion guardrail (4 layers). See{" "}
            <Link href="/platform/policies" className="text-brand-700 hover:underline">
              policies
            </Link>{" "}
            for details and 24-hour block counts.
          </p>
        </div>
      </div>
    </PlatformShell>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const TONE: Record<string, string> = {
    neutral: "text-ink-900",
    green: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
  };
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>{label}</span>
        <span className="text-ink-400">{icon}</span>
      </div>
      <div className={cls("text-xl font-semibold mt-1", TONE[tone])}>{value}</div>
      {hint && <div className="text-[11px] text-ink-500 mt-0.5">{hint}</div>}
    </div>
  );
}

function Panel({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href?: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        {href && (
          <Link href={href} className="text-xs text-brand-700 hover:underline flex items-center gap-1">
            View all <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
      {hasChildren ? (
        <div className="divide-y divide-ink-100">{children}</div>
      ) : (
        <p className="text-sm text-ink-500 py-6 text-center">{empty}</p>
      )}
    </div>
  );
}

function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "brand" | "green" | "amber" | "red";
}) {
  const map: Record<string, string> = {
    brand: "chip-brand",
    green: "chip-green",
    amber: "chip-amber",
    red: "chip-red",
  };
  return <span className={map[variant]}>{label}</span>;
}

function HealthChip({ status, latency }: { status: "ok" | "degraded" | "down" | "not_connected"; latency?: number }) {
  const map: Record<string, string> = {
    ok: "chip-green",
    degraded: "chip-amber",
    down: "chip-red",
    not_connected: "chip-gray",
  };
  return (
    <span className={cls(map[status], "tabular-nums")}>
      {status}
      {latency ? ` · ${latency}ms` : ""}
    </span>
  );
}
