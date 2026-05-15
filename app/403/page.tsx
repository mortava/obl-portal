import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ForbiddenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-ink-50 grid place-items-center p-6">
      <div className="w-full max-w-md card p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 grid place-items-center mx-auto mb-4">
          <ShieldX className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-semibold text-ink-900">Platform access required</h1>
        <p className="text-sm text-ink-600 mt-2">
          Your account doesn&apos;t have permission to view the Platform console. This area is reserved
          for OpenBroker operators.
        </p>
        {user?.email && (
          <p className="text-xs text-ink-500 mt-3">
            Signed in as <span className="text-ink-800 font-medium">{user.email}</span>
          </p>
        )}
        <div className="mt-6 flex gap-2 justify-center">
          <Link href="/" className="btn-secondary h-9">
            <ArrowLeft className="w-4 h-4" />
            Back to portal
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn-ghost h-9 text-ink-600">
              Sign out
            </button>
          </form>
        </div>
        <p className="text-[11px] text-ink-400 mt-6">
          Need access? Contact your platform administrator and ask them to set{" "}
          <code className="bg-ink-100 px-1 rounded">platform_role = &apos;admin&apos;</code> on your profile.
        </p>
      </div>
    </main>
  );
}
