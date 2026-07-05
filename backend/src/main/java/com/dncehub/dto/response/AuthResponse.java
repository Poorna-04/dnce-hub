package com.dncehub.dto.response;

import com.dncehub.entity.enums.Role;

import java.util.UUID;

public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private UUID userId;
    private String email;
    private Role role;

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public UUID getUserId() { return userId; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String accessToken;
        private String refreshToken;
        private UUID userId;
        private String email;
        private Role role;

        public Builder accessToken(String v) { this.accessToken = v; return this; }
        public Builder refreshToken(String v) { this.refreshToken = v; return this; }
        public Builder userId(UUID v) { this.userId = v; return this; }
        public Builder email(String v) { this.email = v; return this; }
        public Builder role(Role v) { this.role = v; return this; }

        public AuthResponse build() {
            AuthResponse r = new AuthResponse();
            r.accessToken = this.accessToken;
            r.refreshToken = this.refreshToken;
            r.userId = this.userId;
            r.email = this.email;
            r.role = this.role;
            return r;
        }
    }
}
