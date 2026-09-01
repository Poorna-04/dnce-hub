import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
  const { accessToken, refreshToken } = await req.json();

  const res = NextResponse.json({ ok: true });

  // Access token: NOT HttpOnly so the Axios client can read it for Authorization header.
  // Short-lived (15 min) so the XSS exposure window is minimal.
  res.cookies.set(ACCESS_COOKIE, accessToken, accessCookieOptions());

  // Refresh token: HttpOnly — JS cannot read this, protecting it from XSS.
  res.cookies.set(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

  return res;
}
