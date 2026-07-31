import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { homePathForRole, isStaffRole } from "@/lib/roles";
import { requireSupabase, supabaseConfigured } from "@/lib/env";

const PUBLIC_PATHS = ["/login", "/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Without real Supabase env values the app can still boot (setup mode) —
  // but nothing is protected, so only allow it in development.
  if (!supabaseConfigured()) {
    if (process.env.NODE_ENV !== "development" && !isPublicPath(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  const { url, anonKey } = requireSupabase();
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not add logic between client creation and getUser() —
  // it refreshes the session cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user) {
    if (isPublicPath(pathname)) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Signal to the login page that this redirect came from the staff area
    // so it can hide social login (Google OAuth creates patient accounts only).
    if (pathname === "/staff" || pathname.startsWith("/staff/")) {
      url.searchParams.set("portal", "staff");
    }
    return NextResponse.redirect(url);
  }

  // Authenticated: resolve role + onboarding state.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_complete")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "patient";
  const onboardingComplete = profile?.onboarding_complete ?? false;

  // Signed-in users don't need the login screen.
  if (isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = onboardingComplete ? homePathForRole(role) : "/onboard";
    return NextResponse.redirect(url);
  }

  // Unonboarded users must complete their profile first.
  const onOnboardPath = pathname === "/onboard" || pathname.startsWith("/onboard/");
  if (!onboardingComplete && !onOnboardPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboard";
    return NextResponse.redirect(url);
  }
  // Already onboarded — don't let them re-visit /onboard.
  if (onboardingComplete && onOnboardPath) {
    const url = request.nextUrl.clone();
    url.pathname = homePathForRole(role);
    return NextResponse.redirect(url);
  }

  // Staff area is blocked for patients.
  if (pathname === "/staff" || pathname.startsWith("/staff/")) {
    if (!isStaffRole(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/today";
      url.searchParams.set("denied", "1");
      return NextResponse.redirect(url);
    }
  }

  return response;
}
