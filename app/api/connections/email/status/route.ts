// GET /api/connections/email/status
//
// Reports whether the Azure email integration is configured, without making
// a network call. Returns a small redacted preview so an operator can confirm
// they are looking at the right tenant.

import { NextResponse } from "next/server";
import { emailConfigured } from "@/lib/server/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = emailConfigured();
  return NextResponse.json({
    configured,
    provider: "microsoft-graph",
    mailFrom: process.env.AZURE_MAIL_FROM ?? null,
    tenantIdPreview: process.env.AZURE_TENANT_ID
      ? `${process.env.AZURE_TENANT_ID.slice(0, 8)}…`
      : null,
    clientIdPreview: process.env.AZURE_CLIENT_ID
      ? `${process.env.AZURE_CLIENT_ID.slice(0, 8)}…`
      : null,
    missing: configured
      ? []
      : ["AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET", "AZURE_TENANT_ID", "AZURE_MAIL_FROM"].filter(
          (k) => !process.env[k]
        ),
  });
}
