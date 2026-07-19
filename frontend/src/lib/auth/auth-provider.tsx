"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { AuthUser } from "@/types/auth";
import { AuthContext } from "./auth-context";

interface AuthProviderProps {
  initialUser: AuthUser;
  children: React.ReactNode;
}

/**
 * Provides auth context to the authenticated route group.
 * `initialUser` is decoded from the HttpOnly-safe cookie by the
 * Server Component layout — no additional fetch needed on mount.
 */
export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const router = useRouter();

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user: initialUser, isAuthenticated: true, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
