import type { AuthUser, Role } from "@/types/auth";

interface JwtPayload {
  sub: string;
  email: string;
  fullName: string;
  role: string; // "ROLE_STUDENT" | "ROLE_INSTRUCTOR"
  exp: number;
  iat: number;
}

/**
 * Decodes the JWT payload (base64url) WITHOUT verifying the signature.
 * Signature verification is the backend's responsibility.
 * We use this only to read non-sensitive display data (name, role, expiry).
 */
export function decodeToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // base64url → base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob !== "undefined"
      ? atob(base64)
      : Buffer.from(base64, "base64").toString("utf-8");

    const payload = JSON.parse(json) as JwtPayload;

    if (payload.exp * 1000 < Date.now()) return null;

    return {
      userId: payload.sub,
      email: payload.email,
      fullName: payload.fullName ?? payload.email,
      role: payload.role.replace("ROLE_", "") as Role,
    };
  } catch {
    return null;
  }
}

export function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}
