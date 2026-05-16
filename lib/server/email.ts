// Microsoft Graph email sender (Azure AD client-credentials flow).
//
// Requires the following Azure app permissions (Application, not Delegated):
//   - Mail.Send  (so the app can send on behalf of AZURE_MAIL_FROM)
// Plus admin consent. The mailbox identified by AZURE_MAIL_FROM must exist in
// the same tenant.
//
// Token endpoint: POST /{tenant}/oauth2/v2.0/token
//   grant_type=client_credentials&scope=https://graph.microsoft.com/.default
// Send endpoint:  POST /v1.0/users/{from}/sendMail   (Bearer access_token)

const GRAPH = "https://graph.microsoft.com/v1.0";

interface CachedToken {
  accessToken: string;
  expiresAtMs: number;
}

let cached: CachedToken | null = null;

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function emailConfigured(): boolean {
  return Boolean(
    process.env.AZURE_CLIENT_ID &&
      process.env.AZURE_CLIENT_SECRET &&
      process.env.AZURE_TENANT_ID &&
      process.env.AZURE_MAIL_FROM
  );
}

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAtMs - 60_000 > Date.now()) {
    return cached.accessToken;
  }

  const tenant = env("AZURE_TENANT_ID");
  const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env("AZURE_CLIENT_ID"),
    client_secret: env("AZURE_CLIENT_SECRET"),
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Azure token request failed (${res.status}): ${detail.slice(0, 400)}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  cached = {
    accessToken: json.access_token,
    expiresAtMs: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

export interface SendMailInput {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  saveToSentItems?: boolean;
}

export interface SendMailResult {
  ok: boolean;
  status: number;
  /** Microsoft Graph returns 202 Accepted with an empty body on success. */
  requestId?: string;
  error?: string;
}

function toRecipients(addrs: string | string[]) {
  const arr = Array.isArray(addrs) ? addrs : [addrs];
  return arr.map((email) => ({ emailAddress: { address: email } }));
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  if (!emailConfigured()) {
    return {
      ok: false,
      status: 0,
      error:
        "Azure email is not configured. Set AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID, AZURE_MAIL_FROM.",
    };
  }

  const token = await getAccessToken();
  const from = env("AZURE_MAIL_FROM");

  const message: Record<string, unknown> = {
    subject: input.subject,
    body: {
      contentType: input.html ? "HTML" : "Text",
      content: input.html ?? input.text ?? "",
    },
    toRecipients: toRecipients(input.to),
  };
  if (input.cc) message.ccRecipients = toRecipients(input.cc);

  const url = `${GRAPH}/users/${encodeURIComponent(from)}/sendMail`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message,
      saveToSentItems: input.saveToSentItems ?? true,
    }),
  });

  if (res.status === 202) {
    return { ok: true, status: 202, requestId: res.headers.get("request-id") ?? undefined };
  }

  const detail = await res.text();
  return { ok: false, status: res.status, error: detail.slice(0, 500) };
}
