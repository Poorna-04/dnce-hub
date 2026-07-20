import { cookies } from "next/headers";
import type { ApiResponse } from "@/types/api";

// Server-side calls go directly to Spring Boot — no proxy needed since
// there's no browser involved, so CORS rules don't apply.
const SPRING_BASE = process.env.SPRING_BASE_URL ?? "http://localhost:8080/api/v1";

/**
 * Fetches a Spring Boot endpoint from a Server Component.
 * Automatically attaches the access token from the current user's cookie
 * when `requireAuth` is true (default: false for public endpoints).
 */
export async function serverFetch<T>(
  path: string,
  options: RequestInit & { requireAuth?: boolean } = {}
): Promise<T> {
  const { requireAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (requireAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get("dnce_access_token")?.value;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${SPRING_BASE}${path}`, {
    ...fetchOptions,
    headers,
    next: { revalidate: 0 }, // always fresh; Redis on Spring Boot handles caching
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }

  const body: ApiResponse<T> = await res.json();
  return body.data as T;
}
