"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { PlatformShell } from "@/components/platform/PlatformShell";
import { SAMPLE_PLATFORM_USERS } from "@/lib/platform-samples";
import { cls, timeAgo } from "@/lib/utils";

type RoleFilter = "all" | "owner" | "admin" | "operator" | "viewer";

const ROLE_CHIP: Record<string, string> = {
  owner: "chip-brand",
  admin: "chip-ai",
  operator: "chip-green",
  viewer: "chip-gray",
};

export default function PlatformUsersPage() {
  const [role, setRole] = useState<RoleFilter>("all");
  const [q, setQ] = useState("");

  const users = useMemo(() => {
    return SAMPLE_PLATFORM_USERS.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        u.email.toLowerCase().includes(s) ||
        u.name.toLowerCase().includes(s) ||
        u.tenantName.toLowerCase().includes(s)
      );
    });
  }, [role, q]);

  return (
    <PlatformShell
      title="Users"
      subtitle="People with access to OpenBroker across all tenants"
      action={
        <button className="btn-primary h-9 px-3">
          <UserPlus className="w-4 h-4" />
          Invite user
        </button>
      }
    >
      <div className="max-w-7xl mx-auto p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs">
            {(["all", "owner", "admin", "operator", "viewer"] as RoleFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cls(
                  "px-3 h-8 rounded-lg font-medium transition-colors",
                  role === r
                    ? "bg-ink-900 text-white"
                    : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"
                )}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, tenant…"
              className="input pl-8 h-9"
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs text-ink-500">
              <tr>
                <th className="text-left font-medium px-4 py-2">User</th>
                <th className="text-left font-medium px-4 py-2">Tenant</th>
                <th className="text-left font-medium px-4 py-2">Role</th>
                <th className="text-left font-medium px-4 py-2">Last seen</th>
                <th className="text-left font-medium px-4 py-2">Invited</th>
                <th className="w-px"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-ink-200 hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <div className="text-ink-900 font-medium">{u.name}</div>
                    <div className="text-xs text-ink-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/platform/tenants/${u.tenantId}`}
                      className="text-sm text-ink-800 hover:underline"
                    >
                      {u.tenantName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={ROLE_CHIP[u.role]}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600">{timeAgo(u.lastSeen)}</td>
                  <td className="px-4 py-3 text-xs text-ink-500">{timeAgo(u.invitedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost h-7 px-2 text-xs">Manage</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">
                    No users match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PlatformShell>
  );
}
