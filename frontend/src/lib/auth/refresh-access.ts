import { SPRING_API_BASE } from "@/lib/api/env";
import type { ApiResponse } from "@/types/api";

/** Exchange a raw refresh token for a new access JWT. Edge-safe. */
export async function exchangeRefreshToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const springRes = await fetch(`${SPRING_API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const body = (await springRes.json().catch(() => ({}))) as ApiResponse<string>;
    if (!springRes.ok || !body.data) return null;
    return body.data;
  } catch {
    return null;
  }
}
