package com.dncehub.service;

import com.dncehub.dto.request.LoginRequest;
import com.dncehub.dto.request.RegisterRequest;
import com.dncehub.dto.response.AuthResponse;
import com.dncehub.entity.RefreshToken;
import com.dncehub.entity.User;
import com.dncehub.exception.AppException;
import com.dncehub.exception.ErrorCode;
import com.dncehub.repository.RefreshTokenRepository;
import com.dncehub.repository.UserRepository;
import com.dncehub.security.JwtTokenProvider;
import com.dncehub.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);

        return buildAuthResponse(UserPrincipal.from(user), user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // AuthenticationManager calls UserDetailsServiceImpl.loadUserByUsername
        // then BCrypt-compares the provided password with the stored hash.
        // Throws BadCredentialsException if wrong — caught by GlobalExceptionHandler.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Revoke any old refresh tokens on fresh login
        refreshTokenRepository.deleteByUserId(user.getId());

        return buildAuthResponse(principal, user);
    }

    @Transactional
    public String refresh(String rawRefreshToken) {
        String hashed = hash(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByToken(hashed)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (stored.isRevoked()) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        UserPrincipal principal = UserPrincipal.from(stored.getUser());
        return jwtTokenProvider.generateAccessToken(principal);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        String hashed = hash(rawRefreshToken);
        refreshTokenRepository.findByToken(hashed).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(UserPrincipal principal, User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String rawRefreshToken = jwtTokenProvider.generateRefreshToken();

        long expiryMs = jwtTokenProvider.getRefreshTokenExpiryMs();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(hash(rawRefreshToken))
                .expiresAt(LocalDateTime.now().plusSeconds(expiryMs / 1000))
                .user(user)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)   // raw token back to client
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    /**
     * SHA-256 hash of the raw refresh token.
     * We store only the hash so a DB leak doesn't expose valid tokens.
     */
    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
