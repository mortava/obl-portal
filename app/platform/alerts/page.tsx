"use client";

import Link from "next/link";
import { useState } from "react";
import { BellRing, CheckCircle2, X } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { SAMPLE_ALERTS } from "@/lib/platform-samples";
import { cls, timeAgo } from "@/lib/utils";
import type { PlatformAlert } from "@/lib/platform-types";

const SEVERITY: Record<PlatformAlert["severity"], { chip: string; ring: string; dot: string }> = {
  critical: { chip: "chip-red", ring: "border-red-300 bg-red-50/30", dot: "bg-red-500" },
  warning: { chip: "chip-amber", ring: "border-amber-300 bg-amber-50/30", dot: "bg-amber-500" },
  info: { chip: "chip-gray", ring: "border-ink-200 bg-white", dot: "bg-ink-400" },
};

export default function PlatformAlertsPage() {
  const [alerts, setAlerts] = useState(SAMPLE_ALERTS);
  const open = alerts.filter((a) => !a.acknowledged);
  const closed = alerts.filter((a) => a.acknowledged);

  function ack(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }

  return (
    <PlatformShell
      title="Alerts"
      subtitle="Operator-visible platform events that need attention"
      alertCount={open.length}
    >
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <Section title={`Open (${open.length})`}>
          {open.length === 0 ? (
            <EmptyAck />
          ) : (
            open.map((a) => <AlertCard key={a.id} alert={a} onAck={() => ack(a.id)} />)
          )}
        </Section>

        {closed.length > 0 && (
          <Section title={`Acknowledged (${closed.length})`}>
            {closed.map((a) => (
              <AlertCard key={a.id} alert={a} muted />
            ))}
          </Section>
        )}
      </div>
    </PlatformShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function AlertCard({
  alert,
  onAck,
  muted,
}: {
  alert: PlatformAlert;
  onAck?: () => void;
  muted?: boolean;
}) {
  const meta = SEVERITY[alert.severity];
  return (
    <div className={cls("card p-4 border-l-4", meta.ring, muted && "opacity-60")}>
      <div className="flex items-start gap-3">
        <span className={cls("w-2.5 h-2.5 rounded-full mt-1.5", meta.dot)} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink-900">{alert.title}</h3>
            <span className={meta.chip}>{alert.severity}</span>
            <span className="text-[11px] text-ink-500">{timeAgo(alert.at)}</span>
          </div>
          <p className="text-xs text-ink-600 mt-1">{alert.detail}</p>
          {alert.tenantId && (
            <Link
              href={`/platform/tenants/${alert.tenantId}`}
              className="text-xs text-brand-700 hover:underline mt-2 inline-block"
            >
              View tenant →
            </Link>
          )}
        </div>
        {onAck && (
          <button
            onClick={onAck}
            className="btn-secondary h-8 px-2 text-xs"
            title="Acknowledge"
          >
            <X className="w-3.5 h-3.5" />
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyAck() {
  return (
    <div className="card p-10 text-center">
      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
      <p className="text-sm text-ink-700 font-medium">All clear.</p>
      <p className="text-xs text-ink-500 mt-1 flex items-center gap-1.5 justify-center">
        <BellRing className="w-3 h-3" /> Nothing requires platform-operator attention right now.
      </p>
    </div>
  );
}
