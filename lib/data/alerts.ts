import { db, useDevFallback } from "./_shared";
import { SAMPLE_ALERTS } from "@/lib/platform-samples";
import type { PlatformAlert } from "@/lib/platform-types";
import { revalidatePath } from "next/cache";

export async function listAlerts(): Promise<PlatformAlert[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("obl_alerts")
    .select("id, severity, tenant_id, title, detail, at, acknowledged")
    .order("at", { ascending: false });

  if (error || !data || data.length === 0) {
    if (useDevFallback() || !data) return SAMPLE_ALERTS;
    return [];
  }

  return data.map((a) => ({
    id: a.id,
    severity: a.severity === "blocked" ? "warning" : (a.severity as "info" | "warning" | "critical"),
    tenantId: a.tenant_id,
    title: a.title,
    detail: a.detail ?? "",
    at: a.at,
    acknowledged: a.acknowledged,
  }));
}

export async function acknowledgeAlert(id: string): Promise<void> {
  const supabase = await db();
  const { data: userData } = await supabase.auth.getUser();
  await supabase
    .from("obl_alerts")
    .update({
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: userData.user?.id ?? null,
    })
    .eq("id", id);
  revalidatePath("/platform/alerts");
  revalidatePath("/platform");
}
