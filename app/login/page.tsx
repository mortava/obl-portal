"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, KeyRound, Sparkles, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cls } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get("next") || "/";

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);

    try {
      const supabase = createClient();
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
      } else {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setInfo("Check your email for a sign-in link.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main
      className="min-h-screen grid place-items-center p-6"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div
            className="w-7 h-7 rounded grid place-items-center text-[11px]"
            style={{ background: "var(--interactive-primary)", color: "#fff" }}
          >
            OB
          </div>
          <div className="leading-tight">
            <div className="text-[15px]" style={{ color: "var(--text-primary)" }}>
              OpenBroker
            </div>
            <div className="mono-caps" style={{ fontSize: 9 }}>
              AI workflow portal
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h1 className="text-lg font-semibold text-ink-900">Sign in</h1>
          <p className="text-xs text-ink-500 mt-1">
            Use your work email to sign in to OpenBroker.
          </p>

          <div className="mt-4 flex items-center rounded-lg border border-ink-200 p-1 bg-ink-50">
            <ModeTab active={mode === "password"} onClick={() => setMode("password")} icon={<KeyRound className="w-3.5 h-3.5" />}>
              Password
            </ModeTab>
            <ModeTab active={mode === "magic"} onClick={() => setMode("magic")} icon={<Mail className="w-3.5 h-3.5" />}>
              Magic link
            </ModeTab>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input h-10"
                autoComplete="email"
                placeholder="you@company.com"
              />
            </div>

            {mode === "password" && (
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input h-10"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={pending || !email || (mode === "password" && !password)}
              className="btn-primary h-10 w-full"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {mode === "password" ? "Sign in" : "Send magic link"}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <div className="flex items-center gap-1.5 font-medium mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Protected portal
            </div>
            All routes except this login page require authentication. Sessions are managed by
            Supabase Auth with secure HTTP-only cookies.
          </div>
        </div>

        <p className="text-[11px] text-ink-400 text-center mt-4">
          Trouble signing in? Contact your platform administrator.
        </p>
      </div>
    </main>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "flex-1 h-8 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
        active ? "bg-white text-ink-900 shadow-card" : "text-ink-600 hover:text-ink-900"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-ink-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
