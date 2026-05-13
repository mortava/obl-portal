"use client";

import Link from "next/link";
import { ShieldCheck, CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { SAMPLE_POLICIES } from "@/lib/platform-samples";
import { cls } from "@/lib/utils";

export default function PlatformPoliciesPage() {
  return (
    <PlatformShell
      title="Policies"
      subtitle="Critical platform guardrails and enforcement state"
    >
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="card p-5 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-ink-400 mt-0.5" />
          <div className="text-sm text-ink-700">
            Policies are the platform-wide rules every tenant inherits. They are enforced at multiple layers so a
            misconfigured workflow or runaway AI cannot bypass them. The canonical reference is{" "}
            <Link href="/" className="text-brand-700 hover:underline">
              <code className="text-xs bg-ink-100 px-1 rounded">POLICIES.md</code>
            </Link>{" "}
            and the {" "}
            <Link href="/" className="text-brand-700 hover:underline">
              <code className="text-xs bg-ink-100 px-1 rounded">knowledge/policies/</code>
            </Link>{" "}
            knowledge base.
          </div>
        </div>

        <div className="space-y-4">
          {SAMPLE_POLICIES.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className={cls(
                      "w-5 h-5 mt-0.5",
                      p.enforced ? "text-emerald-600" : "text-amber-600"
                    )}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">{p.name}</h3>
                    <p className="text-xs text-ink-600 mt-1 max-w-xl">{p.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cls(
                      "chip",
                      p.enforced ? "chip-green" : "chip-amber"
                    )}
                  >
                    {p.enforced ? "Enforced" : "Advisory"}
                  </span>
                  <div className="text-[11px] text-ink-500 mt-1.5">
                    {p.blocked24h} blocked / 24h
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-medium text-ink-700 mb-2">Enforcement layers</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {p.layers.map((l) => (
                    <li
                      key={l.name}
                      className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 bg-white"
                    >
                      {l.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="text-sm text-ink-800">{l.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="text-sm text-ink-700">
              <strong className="text-ink-900">Live verification.</strong> A real DELETE against the deployed
              Supabase edge function returns HTTP 405 with{" "}
              <code className="text-xs bg-white border border-ink-200 px-1 rounded">forbidden_operation</code>{" "}
              from the no-deletion guardrail — see{" "}
              <Link href="/" className="text-brand-700 hover:underline">
                DEPLOY_STATUS.md
              </Link>{" "}
              for the trace.
            </div>
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
