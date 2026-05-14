import { db, useDevFallback } from "./_shared";
import { SAMPLE_AUDIT } from "@/lib/platform-samples";
import type { AuditEntry } from "@/lib/platform-types";

export async function listAuditEntries(limit = 200): Promise<AuditEntry[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("obl_audit_entries")
    .select("id, at, actor, tenant_id, action, summary, severity")
    .order("at", { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    if (useDevFallback() || !data) return SAMPLE_AUDIT;
    return [];
  }

  const tenantIds = Array.from(
    new Set(data.map((d) => d.tenant_id).filter((id): id is string => id !== null))
  );
  const tenantNames = await fetchTenantNames(tenantIds);

  return data.map((e) => ({
    id: e.id,
    at: e.at,
    actor: e.actor,
    tenantId: e.tenant_id,
    tenantName: e.tenant_id ? tenantNames.get(e.tenant_id) ?? null : null,
    action: e.action as AuditEntry["action"],
    summary: e.summary,
    severity: e.severity === "blocked" ? "blocked" : (e.severity as "info" | "warning"),
  }));
}

async function fetchTenantNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const supabase = await db();
  const { data } = await supabase.from("obl_tenants").select("id, name").in("id", ids);
  return new Map((data ?? []).map((t) => [t.id, t.name]));
}
