import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface PlatformAdminContext {
  userId: string;
  email: string | null;
  role: "admin" | "support";
}

/**
 * Server-side guard for /platform/* routes. Redirects:
 *   - unauthenticated → /login?next=/platform
 *   - authenticated but not admin/support → /403
 * Returns the role/user when access is granted.
 */
export async function requirePlatformAdmin(): Promise<PlatformAdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/platform");

  const { data: profile } = await supabase
    .from("obl_profiles")
    .select("platform_role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.platform_role;
  if (role !== "admin" && role !== "support") redirect("/403");

  return { userId: user.id, email: user.email ?? null, role };
}
