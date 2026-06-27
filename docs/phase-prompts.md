# DanceHub — Phase-by-Phase Prompt Guide

> Copy the prompt for the current phase and paste it into the chat.
> After each phase, make a commit, then move to the next prompt.

---

## Phase 1 — Spring Boot Foundation

**Goal:** Working Spring Boot project with PostgreSQL, JPA, Swagger, global exception handling, and Docker.

**Prompt:**
```
We are building DanceHub — a dance instructor booking platform.

Reference files:
- docs/er-diagram.md  (database schema)
- docs/api-plan.md    (API endpoints)
- docs/architecture.md (layered architecture)

Phase 1 goal: Set up the Spring Boot 3 backend foundation.

Requirements:
- Java 21, Maven
- Spring Boot 3
- Spring Data JPA + Hibernate
- PostgreSQL
- Lombok
- Jakarta Validation
- Swagger / OpenAPI 3 (springdoc-openapi)
- Docker (multi-stage Dockerfile)
- MapStruct for entity-DTO mapping
- Global exception handler using @RestControllerAdvice
  returning a consistent ApiResponse<T> envelope:
  { success, message, data, timestamp }
- Standard error codes as an enum (ErrorCode.java)

Folder structure (under src/main/java/com/dancehub/):
  controller/
  service/
  repository/
  entity/
  dto/request/
  dto/response/
  mapper/
  config/
  exception/
  security/      ← leave empty for now
  util/

Create these entities from the ER diagram:
  User, Role, RefreshToken, InstructorProfile, StudentProfile,
  AvailabilitySlot, Booking, Workshop, WorkshopRegistration,
  Review, Notification

Create a basic HealthController with GET /api/v1/health.

Create application.yml with profiles: dev, test, prod.

Do NOT implement authentication yet.
Follow SOLID principles and standard Spring Boot conventions.
```

---

## Phase 2 — Authentication (OAuth2 + JWT)

**Goal:** Secure the app with Spring Security, Google/GitHub OAuth2, and JWT access + refresh tokens.

**Prompt:**
```
Continue building DanceHub backend (phase 2).

Implement full authentication:

1. Email/password signup and login
   - BCrypt password hashing
   - Validate email uniqueness
   - Assign ROLE_STUDENT by default on signup

2. JWT
   - Access token: 15 minutes, signed with HS256
   - Refresh token: 7 days, stored hashed in refresh_tokens table
   - POST /api/v1/auth/refresh → issue new access token
   - POST /api/v1/auth/logout → revoke refresh token

3. OAuth2 social login
   - Google and GitHub providers
   - OAuth2UserService: if user exists, update; if new, create with ROLE_STUDENT
   - OAuth2SuccessHandler: after successful OAuth2 login, generate JWT and
     redirect to frontend with tokens as query params

4. JWT Auth Filter
   - JwtAuthFilter extends OncePerRequestFilter
   - Extract Bearer token, validate, set SecurityContext

5. Security config
   - Stateless session (SessionCreationPolicy.STATELESS)
   - Permit: /api/v1/auth/**, /api/v1/instructors (GET), /swagger-ui/**
   - Require auth: everything else
   - Method-level security: @PreAuthorize("hasRole('INSTRUCTOR')")

6. Role-based access
   - ROLE_STUDENT
   - ROLE_INSTRUCTOR
   - ROLE_ADMIN

Return standard ApiResponse envelope on all endpoints.
Use existing entity and DTO structure from phase 1.
```

---

## Phase 3 — Instructor & Student Profiles

**Goal:** Full CRUD profile management for both roles.

**Prompt:**
```
Continue DanceHub backend (phase 3).

Build complete profile modules.

Instructor profile:
- POST /api/v1/instructors/profile   (create, requires ROLE_INSTRUCTOR)
- PUT  /api/v1/instructors/profile   (update, owns the profile)
- GET  /api/v1/instructors/{id}      (public)
- GET  /api/v1/instructors           (public, paginated search)
  - Query params: style, city, teachingMode, minPrice, maxPrice,
    minRating, page, size, sort
- DELETE /api/v1/instructors/profile (instructor only)
- POST /api/v1/instructors/{id}/verify (ADMIN only)

Student profile:
- POST /api/v1/students/profile    (create, ROLE_STUDENT)
- GET  /api/v1/students/profile    (own profile)
- PUT  /api/v1/students/profile    (update)
- DELETE /api/v1/students/profile  (delete)
- POST   /api/v1/students/saved-instructors/{instructorId}
- DELETE /api/v1/students/saved-instructors/{instructorId}
- GET    /api/v1/students/saved-instructors (paginated)

Rules:
- Use DTOs — never expose entities directly
- Validate all request fields with Jakarta annotations
- Use @PreAuthorize for role checks
- Upload profile picture to Cloudinary (use CloudinaryService)
- Return paginated responses as Page<T> wrapped in ApiResponse
```

---

## Phase 4 — Availability Module

**Goal:** Instructors manage weekly schedules + date overrides.

**Prompt:**
```
Continue DanceHub backend (phase 4).

Build the Availability module.

An instructor can:
- Add a RECURRING slot (day of week + time range, repeats weekly)
- Add a ONE_TIME slot (specific date + time range)
- Block a date (is_available = false override)
- Update or delete any slot they own

A student can:
- GET /api/v1/instructors/{instructorId}/availability?from=DATE&to=DATE
  Returns only available slots in the date range, with RECURRING
  expanded into concrete dates, minus any blocked day overrides.
  Slots with an existing CONFIRMED or PENDING booking are excluded.

Backend validations:
- Prevent overlapping slots for the same instructor
- end_time must be after start_time
- Cannot add a slot in the past

Use proper @Transactional where needed.
Return paginated / list responses in ApiResponse envelope.
```

---

## Phase 5 — Booking Module

**Goal:** Core business logic — book, confirm, cancel, with concurrency safety.

**Prompt:**
```
Continue DanceHub backend (phase 5).

Build the Booking module.

Endpoints:
- POST   /api/v1/bookings              (STUDENT: create booking)
- GET    /api/v1/bookings/{id}         (owner or instructor)
- PATCH  /api/v1/bookings/{id}/confirm  (INSTRUCTOR)
- PATCH  /api/v1/bookings/{id}/cancel   (STUDENT or INSTRUCTOR)
- PATCH  /api/v1/bookings/{id}/complete (INSTRUCTOR)
- GET    /api/v1/bookings/my/upcoming   (paginated)
- GET    /api/v1/bookings/my/history    (paginated, filter by status)

Booking rules:
- Student can only book an available slot (not already PENDING/CONFIRMED)
- Booking status flow: PENDING → CONFIRMED → COMPLETED
                       PENDING/CONFIRMED → CANCELLED
- Instructor confirms or declines pending bookings
- Student can cancel a PENDING or CONFIRMED booking
- Instructor can cancel a CONFIRMED booking (with reason)
- When booking is COMPLETED, enable review creation for that booking

Concurrency safety:
- Use @Version (optimistic locking) on Booking entity
- On OptimisticLockException → return HTTP 409 with message
  "This slot was just booked. Please choose another time."
- Use @Transactional(isolation = READ_COMMITTED) on createBooking

Notification stubs:
- After booking created → create Notification for instructor
- After booking confirmed → create Notification for student
- After booking cancelled → create Notification for the other party

Return proper HTTP status codes and ApiResponse envelope.
```

---

## Phase 6 — Workshop Module

**Goal:** Instructors create workshops, students register.

**Prompt:**
```
Continue DanceHub backend (phase 6).

Build the Workshop module.

Instructor endpoints:
- POST   /api/v1/workshops         (create)
- PUT    /api/v1/workshops/{id}    (update, must own it)
- DELETE /api/v1/workshops/{id}    (cancel)
- GET    /api/v1/workshops/my      (own workshops, paginated)
- GET    /api/v1/workshops/{id}/participants (registered students)

Public / Student endpoints:
- GET  /api/v1/workshops           (search by style, city, date range)
- GET  /api/v1/workshops/{id}      (detail)
- POST /api/v1/workshops/{id}/register   (STUDENT, decrements seats)
- DELETE /api/v1/workshops/{id}/register (cancel registration)

Rules:
- Cannot register for a full workshop (registered_seats >= total_seats)
- Use optimistic locking on registered_seats to prevent race condition
- Instructor can upload a poster image via Cloudinary
- Workshop status auto-updates: UPCOMING → ONGOING → COMPLETED based on date
```

---

## Phase 7 — Reviews Module

**Goal:** Students review instructors after completed bookings.

**Prompt:**
```
Continue DanceHub backend (phase 7).

Build the Reviews module.

Endpoints:
- POST   /api/v1/reviews                        (STUDENT)
- GET    /api/v1/reviews/instructor/{id}        (public, paginated)
- DELETE /api/v1/reviews/{id}                   (owner or ADMIN)
- PATCH  /api/v1/reviews/{id}/visibility        (ADMIN)

Rules:
- Review can only be created if booking.status = COMPLETED
- One review per booking (booking_id is UNIQUE in reviews table)
- Rating fields: overall (1-5), teaching (1-5), communication (1-5)
- After creating / deleting a review, recalculate and update
  instructor_profiles.average_rating and total_reviews
- Sort by: most_recent (default), highest_rated, lowest_rated

Return paginated ReviewResponse with reviewer name and avatar.
Do not expose student email in public review responses.
```

---

## Phase 8 — Next.js Frontend

**Goal:** Full UI with all pages connected to the real API.

**Prompt:**
```
Build the DanceHub Next.js 15 frontend.

Tech:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- TanStack React Query v5
- Axios with interceptor for JWT + refresh token

API base URL from environment: NEXT_PUBLIC_API_URL

Pages and components:
1. Landing page (/)
   - Hero with search bar (style + city)
   - Featured instructors grid
   - How it works section

2. Auth pages
   - /login  — email/password + Google/GitHub OAuth buttons
   - /signup — email/password + Google/GitHub OAuth buttons

3. Search results (/search?style=&city=)
   - Filter sidebar (style, price, rating, teaching mode)
   - Instructor cards grid with pagination

4. Instructor profile (/instructors/[id])
   - Profile header (photo, bio, rating, price)
   - Availability calendar (week view)
   - Reviews section
   - Book button → opens booking modal

5. Dashboard (/dashboard)
   - Role-aware: shows different content for STUDENT vs INSTRUCTOR
   - STUDENT: upcoming bookings, saved instructors
   - INSTRUCTOR: pending bookings to confirm, schedule overview

6. Bookings (/bookings)
   - Tabs: Upcoming, History
   - Booking card with status badge and action buttons

7. Workshops (/workshops)
   - List view with register button
   - INSTRUCTOR: create/edit workshop form

8. Admin (/admin) — ROLE_ADMIN only
   - User list with suspend action
   - Instructor verification queue
   - Review moderation

Authentication:
- Store access token in memory (or httpOnly cookie)
- Store refresh token in httpOnly cookie
- Axios interceptor: on 401, call /auth/refresh and retry
- Protected routes: redirect to /login if not authenticated

Use proper loading states, error boundaries, and toast notifications.
Make the UI responsive (mobile-first).
```

---

## Phase 9 — Docker

**Goal:** Run the full stack locally with one command.

**Prompt:**
```
Create a Docker Compose setup for DanceHub.

Services:
1. postgres
   - Image: postgres:16
   - DB: dancehub, User: dancehub, Password: dancehub_dev
   - Volume: postgres_data

2. backend
   - Multi-stage Dockerfile in backend/
     Stage 1 (build): maven:3.9-eclipse-temurin-21 → mvn package
     Stage 2 (run): eclipse-temurin:21-jre-alpine → run the jar
   - Depends on: postgres
   - Env: spring profiles = docker, datasource URL pointing to postgres service
   - Port: 8080

3. frontend
   - Multi-stage Dockerfile in frontend/
     Stage 1 (build): node:20-alpine → npm ci && npm run build
     Stage 2 (run): node:20-alpine → npm start
   - Depends on: backend
   - Port: 3000
   - Env: NEXT_PUBLIC_API_URL=http://localhost:8080

Place docker-compose.yml in docker/ folder.
Add .env.example files in both backend/ and frontend/ with all required variables.
Add a docker-compose.override.yml for local development with hot-reload.

Running:
  docker compose -f docker/docker-compose.yml up --build
```

---

## Phase 10 — Deployment

**Goal:** Live frontend on Vercel, live backend on Render, database on Neon.

**Prompt:**
```
Help me deploy DanceHub.

1. Neon PostgreSQL setup
   - Create a project at neon.tech
   - Create database: dancehub_prod
   - Get connection string

2. Backend on Render
   - Dockerfile deploy (use backend/Dockerfile)
   - Environment variables to set:
     SPRING_DATASOURCE_URL (Neon connection string)
     SPRING_DATASOURCE_USERNAME
     SPRING_DATASOURCE_PASSWORD
     JWT_SECRET
     GOOGLE_CLIENT_ID
     GOOGLE_CLIENT_SECRET
     CLOUDINARY_URL
   - Health check endpoint: /api/v1/health

3. Frontend on Vercel
   - Connect GitHub repo
   - Set Root Directory: frontend
   - Environment variables:
     NEXT_PUBLIC_API_URL (Render backend URL)
     NEXTAUTH_SECRET (if using next-auth)

4. Update CORS in Spring Security config to allow Vercel domain.
5. Update OAuth2 redirect URIs in Google/GitHub developer console.
6. Update README.md with live demo URLs.
```

---

## Phase 11 — Polish & Professional Features

**Goal:** Tests, CI/CD, logging, email, and production hardening.

**Prompt:**
```
Add professional finishing touches to DanceHub.

1. Unit Tests (JUnit 5 + Mockito)
   - BookingServiceTest (test concurrent booking, status transitions)
   - AuthServiceTest (signup, login, token refresh)
   - ReviewServiceTest (only completed bookings)

2. Integration Tests (Spring Boot Test + Testcontainers)
   - BookingIntegrationTest (full flow: create → confirm → complete → review)
   - AuthIntegrationTest (signup, login, protected endpoint)

3. Logging
   - Use SLF4J + structured logging
   - Log booking lifecycle events at INFO
   - Log security events (login, token refresh) at INFO
   - Log exceptions at ERROR with stack trace

4. Email Notifications (Spring Mail + Gmail SMTP or Resend)
   - Booking confirmed email to student
   - Booking cancelled email to both parties
   - Use HTML templates (Thymeleaf)

5. Rate Limiting
   - Add Bucket4j rate limiting to auth endpoints:
     /auth/login: 5 requests / minute per IP
     /auth/signup: 3 requests / minute per IP

6. Security Headers
   - Add security headers via Spring Security:
     X-Content-Type-Options, X-Frame-Options, HSTS

7. Update README
   - Add architecture diagram screenshot
   - Add Swagger UI screenshot
   - Update phase table to all Done

8. Clean up
   - Remove all TODO comments
   - Make sure all endpoints have Swagger @Operation annotations
   - Run mvn verify and fix any test failures
```

---

## Commit Message Convention

Use Conventional Commits for a clean git history:

```
feat(auth): implement JWT access and refresh token flow
feat(booking): add optimistic locking to prevent double-booking
fix(availability): exclude past dates from recurring slot expansion
docs: add ER diagram and API plan
chore: set up GitHub Actions CI workflows
test(booking): add integration test for concurrent booking
```

Format: `type(scope): short description`
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
