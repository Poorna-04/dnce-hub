import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getCookieValue } from "@/lib/auth/decode-token";
import { BROWSER_API_BASE } from "@/lib/api/env";

export const apiClient = axios.create({
  baseURL: BROWSER_API_BASE,
  headers: { "Content-Type": "application/json" },
});

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/** Login/register 401s are invalid credentials, not an expired session. */
function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  return /\/auth\/(login|register|logout)\b/.test(url);
}

/**
 * Single in-flight refresh. Concurrent 401s await this promise, then retry.
 * Cleared once settled so a later expiry can refresh again.
 */
let refreshInFlight: Promise<boolean> | null = null;
/** After a failed refresh we are heading to /sign-in — do not try again. */
let sessionInvalid = false;

function refreshSession(): Promise<boolean> {
  if (sessionInvalid) return Promise.resolve(false);
  if (!refreshInFlight) {
    refreshInFlight = refreshSessionOnce().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function refreshSessionOnce(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    });
    if (res.ok) return true;
  } catch {
    // Network error — treat as failed refresh.
  }

  sessionInvalid = true;

  try {
    await fetch("/api/auth/clear-token", { method: "POST" });
  } catch {
    // Still send the user to sign-in.
  }

  if (typeof window !== "undefined") {
    window.location.assign("/sign-in");
  }
  return false;
}

function toErrorMessage(error: AxiosError<{ message?: string }>): string {
  return error.response?.data?.message ?? error.message ?? "Something went wrong";
}

// Attach the access token from the browser cookie to every request.
apiClient.interceptors.request.use((config) => {
  const token = getCookieValue("dnce_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const shouldRefresh =
      error.response?.status === 401 &&
      !!originalRequest &&
      !originalRequest._retry &&
      typeof window !== "undefined" &&
      !isPublicAuthRequest(originalRequest.url);

    if (shouldRefresh) {
      originalRequest._retry = true;
      const refreshed = await refreshSession();
      if (refreshed) {
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(new Error(toErrorMessage(error)));
  }
);
