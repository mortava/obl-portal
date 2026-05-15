import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Paths that don't require authentication.
const PUBLIC_PATHS = [
  "/login",
  "/auth/callback",
  "/auth/signout",
  "/auth/confirm",
  "/api/healthz",
  "/403",
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }
  // Allow Next internals and common static assets.
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (/\.(png|jpe?g|gif|svg|webp|ico|css|js|map|woff2?)$/.test(pathname)) return true;
  return false;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured (local dev without env), allow traffic through —
  // signin will fail at the login page with a clear error.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Critical: getUser() refreshes the session cookie if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && !isPublic(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return NextResponse.redirect(home);
  }

  // RBAC gate for the operator console.
  if (user && pathname.startsWith("/platform")) {
    const { data: profile } = await supabase
      .from("obl_profiles")
      .select("platform_role")
      .eq("id", user.id)
      .maybeSingle();
    const role = profile?.platform_role;
    if (role !== "admin" && role !== "support") {
      const forbidden = request.nextUrl.clone();
      forbidden.pathname = "/403";
      forbidden.search = "";
      return NextResponse.redirect(forbidden);
    }
  }

  return response;
}
