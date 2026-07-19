import { NextRequest, NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";
const ACCESS_TOKEN_TTL = 15 * 60;        // 15 min (matches backend)
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days

export async function POST(req: NextRequest) {
  const { accessToken, refreshToken } = await req.json();

  const res = NextResponse.json({ ok: true });

  // Access token: NOT HttpOnly so the Axios client can read it for Authorization header.
  // Short-lived (15 min) so the XSS exposure window is minimal.
  res.cookies.set("dnce_access_token", accessToken, {
    httpOnly: false,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL,
  });

  // Refresh token: HttpOnly — JS cannot read this, protecting it from XSS.
  res.cookies.set("dnce_refresh_token", refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL,
  });

  return res;
}
