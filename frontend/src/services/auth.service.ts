import { apiClient } from "@/lib/api";
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from "@/types";

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data);
    if (!res.data.data) throw new Error(res.data.message ?? "Registration failed");
    return res.data.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data);
    if (!res.data.data) throw new Error(res.data.message ?? "Login failed");
    return res.data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post("/auth/logout", { refreshToken });
  },
};
