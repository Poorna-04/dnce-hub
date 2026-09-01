import { cookies, headers } from "next/headers";
import { decodeToken } from "@/lib/auth/decode-token";
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_HEADER,
} from "@/lib/auth/cookies";
import type { AuthUser } from "@/types/auth";

/**
 * Access JWT for this request: middleware header first (post-refresh),
 * then the cookie (when middleware did not run).
 */
export async function getAccessToken(): Promise<string | null> {
  const headerToken = (await headers()).get(ACCESS_TOKEN_HEADER);
  if (headerToken) return headerToken;

  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = await getAccessToken();
  return token ? decodeToken(token) : null;
}
