import axios from "axios";
import { getCookieValue } from "@/lib/auth/decode-token";
import { BROWSER_API_BASE } from "@/lib/api/env";

export const apiClient = axios.create({
  baseURL: BROWSER_API_BASE,
  headers: { "Content-Type": "application/json" },
});

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
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
