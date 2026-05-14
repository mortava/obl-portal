import { db, useDevFallback } from "./_shared";
import { SAMPLE_PLATFORM_WORKFLOWS } from "@/lib/platform-samples";
import type { PlatformWorkflow } from "@/lib/platform-types";

export async function listPlatformWorkflows(): Promise<PlatformWorkflow[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("obl_workflows")
    .select("id, tenant_id, name, status, env, runs_total, success_rate, last_run_at")
    .order("runs_total", { ascending: false });

  if (error || !data || data.length === 0) {
    if (useDevFallback() || !data) return SAMPLE_PLATFORM_WORKFLOWS;
    return [];
  }

  const tenantIds = Array.from(new Set(data.map((d) => d.tenant_id)));
  const { data: tenants } = await supabase.from("obl_tenants").select("id, name").in("id", tenantIds);
  const nameById = new Map((tenants ?? []).map((t) => [t.id, t.name]));

  return data.map((r) => ({
    id: r.id,
    tenantId: r.tenant_id,
    tenantName: nameById.get(r.tenant_id) ?? "—",
    name: r.name,
    status: r.status,
    env: r.env,
    runs24h: r.runs_total,
    successRate: Number(r.success_rate),
    lastRunAt: r.last_run_at,
  }));
}
