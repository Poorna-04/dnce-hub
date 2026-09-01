import { NextRequest, NextResponse } from "next/server";
import { exchangeRefreshToken } from "@/lib/auth/refresh-access";
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions } from "@/lib/auth/cookies";

/**
 * Browser cannot send the HttpOnly refresh cookie to Spring.
 * This same-origin route reads it and exchanges it for a new access JWT.
 */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const accessToken = await exchangeRefreshToken(refreshToken);
  if (!accessToken) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, accessToken, accessCookieOptions());
  return res;
}
