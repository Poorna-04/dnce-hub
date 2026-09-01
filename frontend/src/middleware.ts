import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeToken } from "@/lib/auth/decode-token";
import { exchangeRefreshToken } from "@/lib/auth/refresh-access";
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_HEADER,
  REFRESH_COOKIE,
  accessCookieOptions,
} from "@/lib/auth/cookies";

function withAccessHeader(request: NextRequest, token: string, setCookie: boolean) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(ACCESS_TOKEN_HEADER);
  requestHeaders.set(ACCESS_TOKEN_HEADER, token);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (setCookie) {
    res.cookies.set(ACCESS_COOKIE, token, accessCookieOptions());
  }
  return res;
}

function redirectToSignIn(request: NextRequest, clearAuthCookies: boolean) {
  const res = NextResponse.redirect(new URL("/sign-in", request.url));
  if (clearAuthCookies) {
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
  }
  return res;
}

export async function middleware(request: NextRequest) {
  const rawAccess = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  let token = rawAccess && decodeToken(rawAccess) ? rawAccess : null;
  let refreshed = false;

  if (!token && refresh) {
    token = await exchangeRefreshToken(refresh);
    refreshed = !!token;
  }

  if (!token) {
    return redirectToSignIn(request, !!refresh);
  }

  return withAccessHeader(request, token, refreshed);
}

export const config = {
  matcher: [
    // Authenticated App Router pages only. Skip sign-in/up, API, and static.
    "/((?!sign-in|sign-up|api/|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
