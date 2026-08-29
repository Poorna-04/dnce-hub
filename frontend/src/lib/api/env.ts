/**
 * Browser (Axios) — relative so requests stay same-origin and hit the
 * Next.js rewrite in next.config.ts. Never point this at Spring directly;
 * that would expose the backend origin and reintroduce CORS.
 */
export const BROWSER_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

/**
 * Server Components and Route Handlers — Node talks to Spring directly
 * (no browser, so no CORS). Docker Compose: http://backend:8080/api/v1
 * Local `next dev`: http://localhost:8080/api/v1
 */
export const SPRING_API_BASE =
  process.env.SPRING_BASE_URL ?? "http://localhost:8080/api/v1";
