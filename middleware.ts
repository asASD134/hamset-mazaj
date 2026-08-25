import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REQUEST_CAFE_HEADER = "x-active-cafe-context";
const DEFAULT_CAFE_SLUG = "hamset-mazaj";

function getCafeFromReferer(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (!referer) return null;

  try {
    const url = new URL(referer);
    if (url.origin !== request.nextUrl.origin) return null;
    return url.searchParams.get("cafe");
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  const fromUrl = request.nextUrl.searchParams.get("cafe");
  const fromReferer = getCafeFromReferer(request);
  const cafeContext = fromUrl || fromReferer || DEFAULT_CAFE_SLUG;

  requestHeaders.set(
    REQUEST_CAFE_HEADER,
    cafeContext
  );

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
