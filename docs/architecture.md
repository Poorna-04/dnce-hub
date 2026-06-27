# DanceHub — System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
│          Browser / Mobile Browser (Next.js SSR + CSR)               │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                         VERCEL EDGE                                  │
│               Next.js 15 App (Frontend)                              │
│   Pages: Landing, Login, Signup, Dashboard, Instructor, Bookings,   │
│          Workshops, Search, Admin                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST API calls (HTTPS + JWT)
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    RENDER.COM (Backend)                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Spring Boot 3 Application                   │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │              Security Layer                          │  │   │
│  │  │  JwtAuthFilter → SecurityContextHolder               │  │   │
│  │  │  OAuth2LoginFilter → issue JWT after social login    │  │   │
│  │  └──────────────────────┬───────────────────────────────┘  │   │
│  │                         │                                    │   │
│  │  ┌──────────────────────▼───────────────────────────────┐  │   │
│  │  │              Controllers (REST)                      │  │   │
│  │  │  AuthController, InstructorController,               │  │   │
│  │  │  BookingController, WorkshopController, ...          │  │   │
│  │  └──────────────────────┬───────────────────────────────┘  │   │
│  │                         │                                    │   │
│  │  ┌──────────────────────▼───────────────────────────────┐  │   │
│  │  │              Services (Business Logic)               │  │   │
│  │  │  BookingService (transactional + optimistic lock)    │  │   │
│  │  │  AvailabilityService, ReviewService, ...             │  │   │
│  │  └──────────────────────┬───────────────────────────────┘  │   │
│  │                         │                                    │   │
│  │  ┌──────────────────────▼───────────────────────────────┐  │   │
│  │  │              Repositories (JPA)                      │  │   │
│  │  └──────────────────────┬───────────────────────────────┘  │   │
│  └─────────────────────────┼────────────────────────────────── ┘  │
└────────────────────────────┼────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
   ┌──────────▼────────────┐   ┌───────────▼──────────┐
   │  Neon PostgreSQL       │   │  Cloudinary CDN      │
   │  (managed cloud DB)    │   │  (images / posters)  │
   └────────────────────────┘   └──────────────────────┘
```

---

## Authentication Flow

### Email / Password Login
```
Client → POST /auth/login (email + password)
       → AuthController → AuthService
       → UserRepository.findByEmail()
       → BCrypt.matches(rawPassword, hash)
       → JwtService.generateAccessToken()  [15 min]
       → JwtService.generateRefreshToken() [7 days, stored in DB]
       → Response: { accessToken, refreshToken }
```

### OAuth2 (Google / GitHub) Login
```
Client → GET /auth/oauth2/google
       → Spring Security redirects to Google consent page
       → Google redirects back to /auth/oauth2/callback?code=...
       → Spring Security exchanges code for user info
       → OAuth2UserService.loadUser()
         → If user exists: update & return
         → If new user: create user + assign ROLE_STUDENT
       → OAuth2SuccessHandler.onAuthenticationSuccess()
       → JwtService.generateAccessToken() + RefreshToken
       → Redirect to frontend with tokens in URL param (or cookie)
```

### JWT Verification (every protected request)
```
Request with Authorization: Bearer <token>
→ JwtAuthFilter.doFilterInternal()
→ JwtService.extractUsername()
→ UserDetailsService.loadUserByUsername()
→ JwtService.isTokenValid()
→ SecurityContextHolder.setAuthentication()
→ Controller proceeds
```

---

## Booking Concurrency Control

Two students can simultaneously try to book the same instructor slot.

**Solution: Optimistic Locking + Database constraint**

```java
// Booking entity has @Version field
@Version
private Long version;

// Service uses @Transactional
@Transactional
public BookingResponse createBooking(BookingRequest request) {
    // 1. Load the slot and verify it's available
    // 2. Check no overlapping CONFIRMED/PENDING booking exists
    //    → SELECT ... FOR UPDATE (pessimistic on the slot)
    // 3. Create the booking
    // 4. If concurrent update detected → OptimisticLockException
    //    → mapped to HTTP 409 Conflict
}
```

---

## Layered Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Controller Layer                        │
│  Handles HTTP: deserialize request, call service, return   │
│  response DTO. No business logic here.                      │
└─────────────────────────┬──────────────────────────────────┘
                          │ uses
┌─────────────────────────▼──────────────────────────────────┐
│                      Service Layer                          │
│  All business rules, transactions, validations, events.    │
│  Uses repositories and other services.                      │
└─────────────────────────┬──────────────────────────────────┘
                          │ uses
┌─────────────────────────▼──────────────────────────────────┐
│                   Repository Layer                          │
│  Spring Data JPA interfaces. Custom JPQL / native queries   │
│  where needed.                                              │
└─────────────────────────┬──────────────────────────────────┘
                          │ maps to
┌─────────────────────────▼──────────────────────────────────┐
│                     Entity Layer                            │
│  JPA entities mapped to PostgreSQL tables.                  │
│  No business logic. Use @Version for optimistic locking.    │
└────────────────────────────────────────────────────────────┘
```

---

## Key Interview Topics This Architecture Covers

| Topic | Where in the project |
|---|---|
| Spring Security | JwtAuthFilter, SecurityConfig, method-level `@PreAuthorize` |
| OAuth2 | Google/GitHub social login, OAuth2UserService |
| JWT | Access + refresh token lifecycle, rotation |
| JPA / Hibernate | Entity mapping, JPQL, lazy/eager loading, N+1 fix |
| Transactions | `@Transactional` in BookingService, rollback rules |
| Optimistic Locking | `@Version` on Booking entity |
| DTO Pattern | Separate request/response DTOs, MapStruct mappers |
| Global Exception Handling | `@RestControllerAdvice`, `ProblemDetail` |
| Validation | Jakarta `@Valid`, custom validators |
| Pagination | Spring Data Pageable, PagedResponse wrapper |
| Docker | Multi-stage Dockerfile, docker-compose |
| CI/CD | GitHub Actions: build → test → push image |
| REST conventions | Consistent status codes, versioned URLs |
| PostgreSQL | Array types, indexes, constraints |
