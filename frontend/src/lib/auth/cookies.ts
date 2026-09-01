/** Cookie and header names shared by middleware, route handlers, and RSC. */
export const ACCESS_COOKIE = "dnce_access_token";
export const REFRESH_COOKIE = "dnce_refresh_token";

/**
 * Set by middleware on the incoming request after a possible refresh.
 * Server Components cannot see a cookie that middleware just Set-Cookie'd
 * on the same response, so they read this header instead.
 */
export const ACCESS_TOKEN_HEADER = "x-dnce-access-token";

export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 min — matches backend JWT
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

const cookieBase = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export function accessCookieOptions() {
  return {
    ...cookieBase,
    httpOnly: false,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  };
}

export function refreshCookieOptions() {
  return {
    ...cookieBase,
    httpOnly: true,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  };
}
