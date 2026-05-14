import { db, useDevFallback } from "./_shared";
import { SAMPLE_TENANTS } from "@/lib/platform-samples";
import type { Tenant } from "@/lib/platform-types";
import type { DbRow } from "@/lib/database.types";

type Row = DbRow<"obl_tenants">;

function toTenant(r: Row & { workflowsLive?: number; runs24h?: number; successRate?: number }): Tenant {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    plan: r.plan,
    status: r.status,
    env: r.env,
    primaryContact: r.primary_contact ?? "",
    monthlyRunBudget: r.monthly_run_budget,
    monthlyRunsUsed: r.monthly_runs_used,
    createdAt: r.created_at,
    workflowsLive: r.workflowsLive ?? 0,
    runs24h: r.runs24h ?? 0,
    successRate: r.successRate ?? 0,
  };
}

export async function listTenants(): Promise<Tenant[]> {
  const supabase = await db();
  const { data: tenants, error: tenantsErr } = await supabase
    .from("obl_tenants")
    .select("*")
    .order("created_at", { ascending: true });

  if (tenantsErr || !tenants || tenants.length === 0) {
    if (useDevFallback() || !tenants) return SAMPLE_TENANTS;
    return tenants.map((t) => toTenant(t));
  }

  // Aggregate workflows + runs per tenant in two more queries.
  const tenantIds = tenants.map((t) => t.id);
  const [{ data: wfRows }, { data: runRows }] = await Promise.all([
    supabase
      .from("obl_workflows")
      .select("tenant_id, status, runs_total, success_rate")
      .in("tenant_id", tenantIds),
    supabase
      .from("obl_runs")
      .select("tenant_id")
      .in("tenant_id", tenantIds)
      .gte("started_at", new Date(Date.now() - 24 * 3600_000).toISOString()),
  ]);

  const wfByTenant = new Map<string, { live: number; runs: number; weighted: number }>();
  for (const w of wfRows ?? []) {
    const cur = wfByTenant.get(w.tenant_id) ?? { live: 0, runs: 0, weighted: 0 };
    if (w.status === "live") cur.live += 1;
    cur.runs += w.runs_total;
    cur.weighted += w.runs_total * Number(w.success_rate);
    wfByTenant.set(w.tenant_id, cur);
  }

  const runs24hByTenant = new Map<string, number>();
  for (const r of runRows ?? []) {
    runs24hByTenant.set(r.tenant_id, (runs24hByTenant.get(r.tenant_id) ?? 0) + 1);
  }

  return tenants.map((t) => {
    const wf = wfByTenant.get(t.id);
    const successRate = wf && wf.runs > 0 ? wf.weighted / wf.runs : 0;
    return toTenant({
      ...t,
      workflowsLive: wf?.live ?? 0,
      runs24h: runs24hByTenant.get(t.id) ?? 0,
      successRate,
    });
  });
}

export async function getTenant(id: string): Promise<Tenant | null> {
  const supabase = await db();
  const { data, error } = await supabase.from("obl_tenants").select("*").eq("id", id).maybeSingle();
  if (error || !data) {
    if (useDevFallback()) return SAMPLE_TENANTS.find((t) => t.id === id) ?? null;
    return null;
  }
  return toTenant(data);
}
