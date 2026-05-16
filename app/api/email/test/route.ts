// POST /api/email/test
//
// Sends a test email via Microsoft Graph to either a body-supplied `to` or
// the signed-in admin's own email address. Requires platform_role in
// ('admin','support') — middleware redirects unauth, this route also checks.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emailConfigured, sendMail } from "@/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("obl_profiles")
    .select("platform_role, email")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.platform_role;
  if (role !== "admin" && role !== "support") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  if (!emailConfigured()) {
    return NextResponse.json(
      { ok: false, error: "AZURE_* env vars not configured" },
      { status: 503 }
    );
  }

  let to: string | undefined;
  try {
    const body = (await request.json()) as { to?: string };
    to = body.to;
  } catch {
    /* no body — fall through to the signed-in user's email */
  }
  to = to || user.email || profile?.email || undefined;
  if (!to) {
    return NextResponse.json({ ok: false, error: "no recipient" }, { status: 400 });
  }

  const result = await sendMail({
    to,
    subject: "OpenBroker portal — test email",
    html: `<p>Hi,</p>
      <p>This is a verification email from the OpenBroker portal proving that the
      <code>AZURE_*</code> credentials are wired correctly and Microsoft Graph
      <code>/users/{from}/sendMail</code> can reach this address.</p>
      <p>If you received this, the email connector is healthy.</p>
      <p style="color:#64748b;font-size:12px">Sent by OpenBroker · ${new Date().toISOString()}</p>`,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : result.status || 500 });
}
