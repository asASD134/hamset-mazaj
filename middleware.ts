import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const cafeSlug = request.nextUrl.searchParams.get("cafe")?.trim();

  // Keep the tenant selector request-scoped. Do not store it in a shared
  // browser cookie: two cafe tabs must be able to stay independent.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-cafe-slug", cafeSlug || "hamset-mazaj");

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
