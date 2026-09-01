import type { ApiResponse } from "@/types/api";
import { SPRING_API_BASE } from "@/lib/api/env";
import { getAccessToken } from "@/lib/auth/server-token";

/**
 * Fetches a Spring Boot endpoint from a Server Component.
 * Automatically attaches the access token (middleware header or cookie)
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
    const token = await getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${SPRING_API_BASE}${path}`, {
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
