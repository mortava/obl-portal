"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  UserCheck,
  ArrowLeft,
  RotateCcw,
  Workflow as WorkflowIcon,
  ChevronRight,
  CircleSlash,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { listRuns, getWorkflow } from "@/lib/storage";
import type { Run, Workflow } from "@/lib/types";
import { cls, fmtDuration, timeAgo } from "@/lib/utils";

const RUN_STATUS = {
  succeeded: { icon: CheckCircle2, chip: "chip-green", label: "Succeeded" },
  failed: { icon: XCircle, chip: "chip-red", label: "Failed" },
  running: { icon: Loader2, chip: "chip-brand", label: "Running" },
  awaiting_human: { icon: UserCheck, chip: "chip-amber", label: "Awaiting human" },
} as const;

const STEP_STATUS = {
  ok: { icon: CheckCircle2, color: "text-emerald-600", chip: "chip-green", label: "OK" },
  fail: { icon: XCircle, color: "text-red-600", chip: "chip-red", label: "Failed" },
  skip: { icon: CircleSlash, color: "text-ink-400", chip: "chip-gray", label: "Skipped" },
} as const;

export default function RunDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [run, setRun] = useState<Run | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    const r = listRuns().find((x) => x.id === params.id);
    if (!r) {
      router.replace("/runs");
      return;
    }
    setRun(r);
    const w = getWorkflow(r.workflowId);
    if (w) setWorkflow(w);
  }, [params.id, router]);

  if (!run) return null;

  const s = RUN_STATUS[run.status];
  const StatusIcon = s.icon;

  // Pair run steps with workflow step definitions when available.
  const stepDefs = new Map(workflow?.steps.map((step) => [step.id, step]));

  return (
    <AppShell
      title={`Run · ${run.id}`}
      subtitle={run.workflowName}
      action={
        <div className="flex items-center gap-2">
          <Link href="/runs" className="btn-ghost h-9">
            <ArrowLeft className="w-4 h-4" />
            All runs
          </Link>
          <button className="btn-secondary h-9" disabled={run.status === "running"}>
            <RotateCcw className="w-4 h-4" />
            Replay
          </button>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <section className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={cls(s.chip, "inline-flex items-center gap-1.5 text-xs px-2 py-1")}>
                <StatusIcon className={cls("w-3.5 h-3.5", run.status === "running" && "animate-spin")} />
                {s.label}
              </span>
              <Link
                href={`/workflows/${run.workflowId}`}
                className="text-sm text-ink-700 hover:underline flex items-center gap-1.5"
              >
                <WorkflowIcon className="w-3.5 h-3.5 text-ink-400" />
                {run.workflowName}
              </Link>
            </div>
            <div className="text-right text-xs text-ink-500">
              Started {timeAgo(run.startedAt)}
              <div className="text-ink-700 font-medium text-sm tabular-nums">
                {fmtDuration(run.durationMs)}
              </div>
            </div>
          </div>
          {run.loanRef && (
            <div className="mt-4 text-xs text-ink-600">
              Loan:{" "}
              <code className="bg-ink-100 px-1.5 py-0.5 rounded font-mono text-ink-800">
                {run.loanRef}
              </code>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Step timeline</h2>
          <div className="card overflow-hidden">
            {run.steps.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-500">No steps recorded.</div>
            ) : (
              <ol className="divide-y divide-ink-200">
                {run.steps.map((step, idx) => {
                  const meta = STEP_STATUS[step.status];
                  const Icon = meta.icon;
                  const def = stepDefs.get(step.id);
                  return (
                    <li key={step.id} className="px-5 py-4 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-ink-100 text-ink-700 grid place-items-center text-xs font-medium shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="text-sm font-medium text-ink-900">{step.id}</code>
                          <span className={meta.chip}>
                            <Icon className={cls("w-3 h-3 inline mr-0.5", meta.color)} />
                            {meta.label}
                          </span>
                          {def && (
                            <span className="text-[11px] text-ink-500">
                              <ChevronRight className="w-3 h-3 inline" />
                              <code className="bg-ink-100 px-1 py-0.5 rounded">{def.use}</code>
                            </span>
                          )}
                        </div>
                        {def && Object.keys(def.with).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-ink-500 cursor-pointer hover:text-ink-700">
                              Inputs
                            </summary>
                            <pre className="text-[11px] bg-ink-50 border border-ink-200 rounded-md p-2 mt-1 overflow-auto">
                              {JSON.stringify(def.with, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <div className="text-right text-xs text-ink-500 shrink-0 tabular-nums">
                        {step.durationMs ? fmtDuration(step.durationMs) : "—"}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>

        {run.status === "awaiting_human" && (
          <section className="card p-5 border-amber-200 bg-amber-50/40">
            <div className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Approval needed</h3>
                <p className="text-xs text-ink-600 mt-1">
                  This run is paused waiting for a human reviewer. Open the workflow detail to see the
                  approval step's prompt and the run will resume once approved.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-primary h-8 px-3 text-xs">Approve</button>
                  <button className="btn-secondary h-8 px-3 text-xs">Reject</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {run.status === "failed" && (
          <section className="card p-5 border-red-200 bg-red-50/40">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Failure summary</h3>
                <p className="text-xs text-ink-600 mt-1">
                  The first failing step is highlighted above. Click <strong>Replay</strong> to retry from the
                  failed step after fixing the inputs or upstream data.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
