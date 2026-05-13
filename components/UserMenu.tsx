"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cls } from "@/lib/utils";

interface MinimalUser {
  id: string;
  email: string | null;
}

export function UserMenu({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [user, setUser] = useState<MinimalUser | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let supabase: ReturnType<typeof createClient> | null = null;

    try {
      supabase = createClient();
    } catch {
      // env not wired locally — render nothing
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted || !data.user) return;
      setUser({ id: data.user.id, email: data.user.email ?? null });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user) return null;

  const initials = (user.email ?? "?").charAt(0).toUpperCase();
  const isDark = variant === "dark";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cls(
          "h-9 px-2 rounded-lg flex items-center gap-2 text-sm transition-colors",
          isDark
            ? "text-ink-100 hover:bg-ink-800"
            : "text-ink-700 hover:bg-ink-100"
        )}
      >
        <span
          className={cls(
            "w-6 h-6 rounded-full grid place-items-center text-[11px] font-semibold",
            isDark ? "bg-white text-ink-900" : "bg-ink-900 text-white"
          )}
        >
          {initials}
        </span>
        <span className="hidden sm:inline max-w-[140px] truncate">{user.email ?? "Account"}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 card p-1 z-50">
          <div className="px-3 py-2 border-b border-ink-100">
            <div className="text-xs text-ink-500">Signed in as</div>
            <div className="text-sm font-medium text-ink-900 truncate">{user.email}</div>
          </div>
          <div className="px-3 py-2 text-xs text-ink-500 flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5" />
            <code className="text-[10px] truncate">{user.id}</code>
          </div>
          <form action="/auth/signout" method="post" className="border-t border-ink-100 pt-1">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-ink-700 hover:bg-ink-50"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
