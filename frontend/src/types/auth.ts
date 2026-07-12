export const ROLES = {
  STUDENT: "STUDENT",
  INSTRUCTOR: "INSTRUCTOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Matches Spring Boot AuthResponse DTO */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  role: Role;
}

/** Matches Spring Boot RegisterRequest DTO */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

/** Matches Spring Boot LoginRequest DTO */
export interface LoginRequest {
  email: string;
  password: string;
}
