import { db, useDevFallback } from "./_shared";
import { SAMPLE_PLATFORM_USERS } from "@/lib/platform-samples";
import type { PlatformUser } from "@/lib/platform-types";

export async function listPlatformUsers(): Promise<PlatformUser[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("obl_profiles")
    .select("id, email, name, tenant_id, tenant_role, last_seen, invited_at")
    .order("invited_at", { ascending: false });

  if (error || !data || data.length === 0) {
    if (useDevFallback() || !data) return SAMPLE_PLATFORM_USERS;
    return [];
  }

  const tenantIds = Array.from(
    new Set(data.map((d) => d.tenant_id).filter((id): id is string => id !== null))
  );
  const { data: tenants } = await supabase
    .from("obl_tenants")
    .select("id, name")
    .in("id", tenantIds);
  const tenantName = new Map((tenants ?? []).map((t) => [t.id, t.name]));

  return data
    .filter((u) => u.tenant_id !== null)
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      name: u.name ?? "",
      tenantId: u.tenant_id ?? "",
      tenantName: u.tenant_id ? tenantName.get(u.tenant_id) ?? "" : "",
      role: (u.tenant_role ?? "viewer") as PlatformUser["role"],
      lastSeen: u.last_seen,
      invitedAt: u.invited_at ?? new Date().toISOString(),
    }));
}
