import { NextRequest, NextResponse } from "next/server";
import { SPRING_API_BASE } from "@/lib/api/env";
import type { ApiResponse } from "@/types/api";

const IS_PROD = process.env.NODE_ENV === "production";
const ACCESS_TOKEN_TTL = 15 * 60; // 15 min — same as set-token / backend JWT

/**
 * Browser cannot send the HttpOnly refresh cookie to Spring.
 * This same-origin route reads it and exchanges it for a new access JWT.
 */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("dnce_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let springRes: Response;
  try {
    springRes = await fetch(`${SPRING_API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await springRes.json().catch(() => ({}))) as ApiResponse<string>;
  const accessToken = body.data;

  if (!springRes.ok || !accessToken) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // Access token stays readable by Axios (NOT HttpOnly). Same options as set-token.
  res.cookies.set("dnce_access_token", accessToken, {
    httpOnly: false,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL,
  });

  return res;
}
