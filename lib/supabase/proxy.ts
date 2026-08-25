import { NextResponse, type NextRequest } from "next/server";

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

function shouldPreserveCafeInUrl(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico") return false;
  if (pathname.startsWith("/api/")) return false;
  if (pathname === "/login") return false;

  return true;
}

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone();
  const explicitCafe = url.searchParams.get(CAFE_QUERY_PARAM);
  const refererCafe = explicitCafe || getCafeFromReferer(request);
  const resolvedCafe = refererCafe || DEFAULT_CAFE_SLUG;

  if (!explicitCafe && refererCafe && shouldPreserveCafeInUrl(request)) {
    url.searchParams.set(CAFE_QUERY_PARAM, refererCafe);
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_CAFE_HEADER, resolvedCafe);
  requestHeaders.set(REQUEST_PATH_HEADER, request.nextUrl.pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (explicitCafe) {
    response.cookies.set(COOKIE_NAME, explicitCafe, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  // Authentication is checked by the server layouts/API routes that actually
  // need it. Do not perform a remote Supabase auth call on every navigation;
  // that was making local admin pages wait on the network before rendering.
  return response;
}
