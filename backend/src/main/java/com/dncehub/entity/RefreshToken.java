package com.dncehub.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 512)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean revoked = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public RefreshToken() {}

    public Long getId() { return id; }
    public String getToken() { return token; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isRevoked() { return revoked; }
    public User getUser() { return user; }

    public void setToken(String token) { this.token = token; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
    public void setUser(User user) { this.user = user; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private LocalDateTime expiresAt;
        private boolean revoked = false;
        private User user;

        public Builder token(String token) { this.token = token; return this; }
        public Builder expiresAt(LocalDateTime e) { this.expiresAt = e; return this; }
        public Builder revoked(boolean r) { this.revoked = r; return this; }
        public Builder user(User user) { this.user = user; return this; }

        public RefreshToken build() {
            RefreshToken rt = new RefreshToken();
            rt.token = this.token;
            rt.expiresAt = this.expiresAt;
            rt.revoked = this.revoked;
            rt.user = this.user;
            return rt;
        }
    }
}
