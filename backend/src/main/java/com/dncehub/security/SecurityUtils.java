package com.dncehub.security;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Reads the authenticated user's UUID and role from the SecurityContext.
 * The JwtAuthenticationFilter already validated the token and placed
 * a UserPrincipal into the context — we just retrieve it here.
 */
public class SecurityUtils {

    private SecurityUtils() {}

    public static UUID getCurrentUserId() {
        return getPrincipal().getId();
    }

    public static String getCurrentUserRole() {
        return getPrincipal().getAuthorities()
                .iterator().next()
                .getAuthority()
                .replace("ROLE_", "");
    }

    private static UserPrincipal getPrincipal() {
        return (UserPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }
}
