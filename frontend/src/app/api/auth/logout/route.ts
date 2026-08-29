import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SPRING_API_BASE } from "@/lib/api/env";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("dnce_refresh_token")?.value;

  // Best-effort: tell Spring Boot to revoke the refresh token in the DB.
  if (refreshToken) {
    try {
      await fetch(`${SPRING_API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // If Spring Boot is unreachable, still clear the cookies.
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete("dnce_access_token");
  res.cookies.delete("dnce_refresh_token");
  return res;
}
