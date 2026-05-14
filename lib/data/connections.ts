import { db, useDevFallback } from "./_shared";
import { SAMPLE_CONNECTION_HEALTH } from "@/lib/platform-samples";
import type { ConnectionHealth } from "@/lib/platform-types";

export async function listConnectionHealth(): Promise<ConnectionHealth[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("obl_connections")
    .select("id, tenant_id, service, env")
    .order("connected_at", { ascending: true });

  if (error || !data || data.length === 0) {
    if (useDevFallback() || !data) return SAMPLE_CONNECTION_HEALTH;
    return [];
  }

  const tenantIds = Array.from(new Set(data.map((d) => d.tenant_id)));
  const connIds = data.map((d) => d.id);

  const [{ data: tenants }, { data: checks }] = await Promise.all([
    supabase.from("obl_tenants").select("id, name").in("id", tenantIds),
    supabase
      .from("obl_connection_health_checks")
      .select("connection_id, status, latency_ms, checked_at")
      .in("connection_id", connIds)
      .order("checked_at", { ascending: false }),
  ]);
  const tenantName = new Map((tenants ?? []).map((t) => [t.id, t.name]));

  // Most recent check per connection.
  const latestByConn = new Map<
    string,
    { status: ConnectionHealth["status"]; latencyMs: number | null; checkedAt: string }
  >();
  for (const c of checks ?? []) {
    if (!latestByConn.has(c.connection_id)) {
      latestByConn.set(c.connection_id, {
        status: c.status,
        latencyMs: c.latency_ms,
        checkedAt: c.checked_at,
      });
    }
  }

  return data.map((c) => {
    const latest = latestByConn.get(c.id);
    return {
      tenantId: c.tenant_id,
      tenantName: tenantName.get(c.tenant_id) ?? "—",
      service: c.service,
      env: c.env,
      status: latest?.status ?? "not_connected",
      lastCheckAt: latest?.checkedAt ?? new Date().toISOString(),
      latencyMs: latest?.latencyMs ?? undefined,
    };
  });
}
