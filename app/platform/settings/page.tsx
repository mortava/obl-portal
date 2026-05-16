import { Mail, ShieldCheck, KeyRound, Globe, GitBranch, Database } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { SendTestEmailButton } from "@/components/platform/SendTestEmailButton";
import { emailConfigured } from "@/lib/server/email";

export default function PlatformSettingsPage() {
  const azureReady = emailConfigured();
  const mailFrom = process.env.AZURE_MAIL_FROM ?? null;

  return (
    <PlatformShell title="Platform settings" subtitle="Operator-only configuration">
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <Section
          icon={<Globe className="w-4 h-4" />}
          title="Default environment for new tenants"
          desc="Trial tenants always start in sandbox; this controls the default for paid tenants."
        >
          <select className="input h-9 w-48">
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </select>
        </Section>

        <Section
          icon={<KeyRound className="w-4 h-4" />}
          title="Shared Anthropic API key"
          desc="Falls back to this key when a tenant has not configured their own. Empty disables fallback."
        >
          <input
            type="password"
            className="input h-9 w-full"
            placeholder="sk-ant-… (read-only)"
            defaultValue="sk-ant-•••••••••••••••••••"
            readOnly
          />
        </Section>

        <Section
          icon={<Mail className="w-4 h-4" />}
          title="Outbound email (Microsoft Graph)"
          desc="Used for user invitations, alert notifications, and notify.email workflow steps. Authenticated via Azure AD client credentials."
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <KV label="Status" value={azureReady ? "configured" : "missing env vars"} tone={azureReady ? "green" : "amber"} />
              <KV label="Mail from" value={mailFrom ?? "—"} mono />
              <KV
                label="Tenant ID"
                value={process.env.AZURE_TENANT_ID ? `${process.env.AZURE_TENANT_ID.slice(0, 8)}…` : "—"}
                mono
              />
              <KV
                label="Client ID"
                value={process.env.AZURE_CLIENT_ID ? `${process.env.AZURE_CLIENT_ID.slice(0, 8)}…` : "—"}
                mono
              />
            </div>
            <SendTestEmailButton configured={azureReady} mailFrom={mailFrom} />
          </div>
        </Section>

        <Section
          icon={<ShieldCheck className="w-4 h-4" />}
          title="Enforce no-deletion guardrail globally"
          desc="Cannot be disabled by tenant operators. All DELETE requests to Encompass return HTTP 405."
        >
          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked disabled className="rounded border-ink-300" />
            <span className="text-ink-600">Enforced (locked)</span>
          </div>
        </Section>

        <Section
          icon={<GitBranch className="w-4 h-4" />}
          title="Workflow rollback window"
          desc="How many versions to keep per workflow for rollback."
        >
          <input type="number" min={1} max={50} defaultValue={10} className="input h-9 w-24" />
        </Section>

        <Section
          icon={<Database className="w-4 h-4" />}
          title="Runtime backing store"
          desc="Where workflow state and run history are persisted. Switch carefully — requires migration."
        >
          <select className="input h-9 w-64">
            <option value="supabase">Supabase Postgres (default)</option>
            <option value="temporal">Temporal (planned)</option>
            <option value="inngest">Inngest (planned)</option>
          </select>
        </Section>

        <div className="flex justify-end gap-2">
          <button className="btn-secondary h-9 px-4">Cancel</button>
          <button className="btn-primary h-9 px-4">Save settings</button>
        </div>
      </div>
    </PlatformShell>
  );
}

function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-3">
        <span className="w-8 h-8 rounded-lg bg-ink-100 text-ink-700 grid place-items-center shrink-0">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          <p className="text-xs text-ink-500 mt-0.5">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function KV({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "green" | "amber" | "red";
}) {
  const TONE: Record<string, string> = {
    green: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
  };
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className={`${mono ? "font-mono" : ""} ${tone ? TONE[tone] : "text-ink-800"}`}>
        {value}
      </div>
    </div>
  );
}
