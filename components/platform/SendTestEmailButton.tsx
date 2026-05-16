"use client";

import { useState } from "react";
import { Loader2, Mail, CheckCircle2, AlertTriangle } from "lucide-react";

interface Result {
  ok: boolean;
  status?: number;
  error?: string;
}

export function SendTestEmailButton({
  configured,
  mailFrom,
}: {
  configured: boolean;
  mailFrom: string | null;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function send() {
    setPending(true);
    setResult(null);
    try {
      const res = await fetch("/api/email/test", { method: "POST" });
      const json = (await res.json()) as Result;
      setResult(json);
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : "network error" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={send}
          disabled={pending || !configured}
          className="btn-secondary h-9 px-3"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          Send test email
        </button>
        {!configured && (
          <span className="text-xs text-amber-700">AZURE_* env vars are not set.</span>
        )}
        {mailFrom && (
          <span className="text-xs text-ink-500">
            from <code className="bg-ink-100 px-1 rounded">{mailFrom}</code>
          </span>
        )}
      </div>
      {result?.ok && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Sent — Microsoft Graph accepted the request (HTTP 202).
        </div>
      )}
      {result && !result.ok && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900 inline-flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Failed
            {result.status ? ` (HTTP ${result.status})` : ""}: {result.error ?? "unknown error"}
          </span>
        </div>
      )}
    </div>
  );
}
