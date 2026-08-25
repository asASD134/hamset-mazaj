import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const REQUEST_CAFE_HEADER = "x-active-cafe-context";
const REQUEST_PATH_HEADER = "x-request-pathname";
const CAFE_QUERY_PARAM = "cafe";
const COOKIE_NAME = "active_cafe_context";
const DEFAULT_CAFE_SLUG = "hamset-mazaj";

function getCafeFromReferer(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (!referer) return null;

  try {
    const url = new URL(referer);
    if (url.origin !== request.nextUrl.origin) return null;
    return url.searchParams.get(CAFE_QUERY_PARAM);
  } catch {
    return null;
  }
}

function cameFromCafeManagement(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (!referer) return false;

  try {
    const url = new URL(referer);
    return url.origin === request.nextUrl.origin && url.pathname === "/admin/cafes";
  } catch {
    return false;
  }
}

function shouldPreserveCafeInUrl(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico") return false;
  if (pathname.startsWith("/api/")) return false;
  if (pathname === "/login") return false;

  return true;
}

function shouldRefreshAuth(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin/") ||
    pathname === "/login"
  );
}

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone();
  const explicitCafe = url.searchParams.get(CAFE_QUERY_PARAM);

  // The existing "إعدادات المنصة" action on the system-admin cafe manager
  // opens the new global settings page. Cafe-specific settings always carry
  // an explicit ?cafe=... parameter and therefore remain untouched.
  if (
    request.nextUrl.pathname === "/admin/settings" &&
    !explicitCafe &&
    cameFromCafeManagement(request)
  ) {
    url.pathname = "/admin/platform-settings";
    return NextResponse.redirect(url);
  }

  const refererCafe = explicitCafe || getCafeFromReferer(request);
  const resolvedCafe = refererCafe || DEFAULT_CAFE_SLUG;

  if (!explicitCafe && refererCafe && shouldPreserveCafeInUrl(request)) {
    url.searchParams.set(CAFE_QUERY_PARAM, refererCafe);
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_CAFE_HEADER, resolvedCafe);
  requestHeaders.set(REQUEST_PATH_HEADER, request.nextUrl.pathname);

  const makeResponse = () =>
    NextResponse.next({
      request: { headers: requestHeaders },
    });

  let response = makeResponse();

  if (shouldRefreshAuth(request)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });

            response = makeResponse();
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    await supabase.auth.getUser();
  }

  if (explicitCafe) {
    response.cookies.set(COOKIE_NAME, explicitCafe, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
