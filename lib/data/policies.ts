import { db, useDevFallback } from "./_shared";
import { SAMPLE_POLICIES } from "@/lib/platform-samples";
import type { PolicyStatus } from "@/lib/platform-types";

export async function listPolicies(): Promise<PolicyStatus[]> {
  const supabase = await db();
  const { data: policies, error } = await supabase
    .from("obl_policies")
    .select("id, name, enforced, description, blocked_24h")
    .order("id", { ascending: true });

  if (error || !policies || policies.length === 0) {
    if (useDevFallback() || !policies) return SAMPLE_POLICIES;
    return [];
  }

  const policyIds = policies.map((p) => p.id);
  const { data: layers } = await supabase
    .from("obl_policy_layers")
    .select("policy_id, idx, name, ok")
    .in("policy_id", policyIds)
    .order("idx", { ascending: true });

  const layersByPolicy = new Map<string, { name: string; ok: boolean }[]>();
  for (const l of layers ?? []) {
    const arr = layersByPolicy.get(l.policy_id) ?? [];
    arr.push({ name: l.name, ok: l.ok });
    layersByPolicy.set(l.policy_id, arr);
  }

  return policies.map((p) => ({
    id: p.id,
    name: p.name,
    enforced: p.enforced,
    description: p.description ?? "",
    blocked24h: p.blocked_24h,
    layers: layersByPolicy.get(p.id) ?? [],
  }));
}
