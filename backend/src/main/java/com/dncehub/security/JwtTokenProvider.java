package com.dncehub.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

/**
 * Responsible for three things:
 *  1. Creating signed JWTs (access tokens)
 *  2. Validating incoming JWTs
 *  3. Extracting the user's UUID from a valid JWT
 *
 * The refresh token is intentionally NOT a JWT — it's a random UUID string
 * stored hashed in the database. This allows us to revoke it on logout,
 * which is impossible with a stateless JWT.
 */
@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long accessTokenExpiryMs;
    private final long refreshTokenExpiryMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String base64Secret,
            @Value("${app.jwt.access-token-expiry-ms}") long accessTokenExpiryMs,
            @Value("${app.jwt.refresh-token-expiry-ms}") long refreshTokenExpiryMs) {

        // Decode the base64 secret and build an HMAC-SHA256 key
        byte[] keyBytes = Base64.getDecoder().decode(base64Secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpiryMs = accessTokenExpiryMs;
        this.refreshTokenExpiryMs = refreshTokenExpiryMs;
    }

    /**
     * Builds a signed JWT access token.
     *
     * Structure:
     *   Header:  { alg: HS256, typ: JWT }
     *   Payload: { sub: "<userId UUID>", email: "...", role: "ROLE_STUDENT", iat: ..., exp: ... }
     *   Signature: HMAC-SHA256(header.payload, secret)
     */
    public String generateAccessToken(UserPrincipal principal) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(principal.getId().toString())
                .claim("email", principal.getUsername())
                .claim("role", principal.getAuthorities().iterator().next().getAuthority())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(accessTokenExpiryMs)))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Generates a refresh token — just a random UUID string.
     * The caller is responsible for hashing and storing it in the DB.
     *
     * We don't use a JWT here because refresh tokens need to be revocable:
     * on logout we mark the DB record as revoked. A JWT has no revocation
     * mechanism without a server-side store, so a random opaque token is better.
     */
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public long getRefreshTokenExpiryMs() {
        return refreshTokenExpiryMs;
    }

    /**
     * Returns true if the token is well-formed, correctly signed, and not expired.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extracts the userId (stored as the JWT subject) from a valid token.
     */
    public UUID getUserIdFromToken(String token) {
        String subject = parseClaims(token).getSubject();
        return UUID.fromString(subject);
    }

    public String getEmailFromToken(String token) {
        return parseClaims(token).get("email", String.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
