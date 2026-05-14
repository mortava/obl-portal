import { db, useDevFallback } from "./_shared";
import { SAMPLE_PLATFORM_WORKFLOWS } from "@/lib/platform-samples";
import { SAMPLE_RUNS } from "@/lib/samples";
import type { Run } from "@/lib/types";

export interface PlatformRunRow extends Run {
  tenantId: string;
  tenantName: string;
}

const FALLBACK_PLATFORM_RUNS: PlatformRunRow[] = SAMPLE_RUNS.flatMap((r) => {
  const tenants = Array.from(
    new Map(SAMPLE_PLATFORM_WORKFLOWS.map((w) => [w.tenantId, w.tenantName])).entries()
  ).slice(0, 3);
  return tenants.map(([tenantId, tenantName], i) => ({
    ...r,
    id: `${r.id}-${tenantId}`,
    tenantId,
    tenantName,
    startedAt: new Date(new Date(r.startedAt).getTime() - i * 3600_000).toISOString(),
  }));
});

export async function listPlatformRuns(limit = 200): Promise<PlatformRunRow[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("obl_runs")
    .select("id, status, started_at, duration_ms, loan_ref, tenant_id, workflow_id")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    if (useDevFallback() || !data) return FALLBACK_PLATFORM_RUNS;
    return [];
  }

  const tenantIds = Array.from(new Set(data.map((d) => d.tenant_id)));
  const workflowIds = Array.from(new Set(data.map((d) => d.workflow_id)));

  const [{ data: tenants }, { data: workflows }] = await Promise.all([
    supabase.from("obl_tenants").select("id, name").in("id", tenantIds),
    supabase.from("obl_workflows").select("id, name").in("id", workflowIds),
  ]);
  const tenantName = new Map((tenants ?? []).map((t) => [t.id, t.name]));
  const workflowName = new Map((workflows ?? []).map((w) => [w.id, w.name]));

  return data.map((r) => ({
    id: r.id,
    workflowId: r.workflow_id,
    workflowName: workflowName.get(r.workflow_id) ?? "—",
    tenantId: r.tenant_id,
    tenantName: tenantName.get(r.tenant_id) ?? "—",
    status: r.status,
    startedAt: r.started_at,
    durationMs: r.duration_ms ?? 0,
    loanRef: r.loan_ref ?? undefined,
    steps: [],
  }));
}
