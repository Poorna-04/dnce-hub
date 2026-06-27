# DanceHub — REST API Plan

Base URL: `/api/v1`

---

## Auth  `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register with email + password |
| POST | `/auth/login` | Public | Login → returns access + refresh token |
| POST | `/auth/refresh` | Public | Exchange refresh token for new access token |
| POST | `/auth/logout` | User | Revoke refresh token |
| GET | `/auth/oauth2/google` | Public | Redirect to Google OAuth consent |
| GET | `/auth/oauth2/github` | Public | Redirect to GitHub OAuth consent |
| GET | `/auth/oauth2/callback` | Public | OAuth2 callback — issues JWT |
| GET | `/auth/me` | User | Get current authenticated user info |

---

## Users  `/api/v1/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/{id}` | User | Get public user profile |
| PATCH | `/users/me` | User | Update name / profile picture |
| DELETE | `/users/me` | User | Soft-delete own account |
| GET | `/users` | Admin | List all users |
| PATCH | `/users/{id}/status` | Admin | Suspend or reactivate account |

---

## Instructor Profiles  `/api/v1/instructors`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/instructors` | Public | Search instructors (filter + paginate) |
| GET | `/instructors/{id}` | Public | Get instructor profile |
| POST | `/instructors/profile` | Instructor | Create instructor profile |
| PUT | `/instructors/profile` | Instructor | Update instructor profile |
| DELETE | `/instructors/profile` | Instructor | Delete instructor profile |
| POST | `/instructors/{id}/verify` | Admin | Mark instructor as verified |

**Search query params:** `style`, `city`, `teachingMode`, `minPrice`, `maxPrice`, `minRating`, `page`, `size`, `sort`

---

## Student Profiles  `/api/v1/students`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/students/profile` | Student | Create student profile |
| GET | `/students/profile` | Student | Get own profile |
| PUT | `/students/profile` | Student | Update own profile |
| DELETE | `/students/profile` | Student | Delete own profile |
| POST | `/students/saved-instructors/{instructorId}` | Student | Save an instructor |
| DELETE | `/students/saved-instructors/{instructorId}` | Student | Unsave an instructor |
| GET | `/students/saved-instructors` | Student | List saved instructors |

---

## Availability  `/api/v1/instructors/{instructorId}/availability`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/availability` | Public | Get instructor's available slots |
| POST | `/availability` | Instructor | Add a recurring or one-time slot |
| PUT | `/availability/{slotId}` | Instructor | Update a slot |
| DELETE | `/availability/{slotId}` | Instructor | Remove a slot |
| POST | `/availability/block` | Instructor | Block a date range (vacation) |

---

## Bookings  `/api/v1/bookings`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/bookings` | Student | Create a booking |
| GET | `/bookings/{id}` | Student/Instructor | Get booking detail |
| PATCH | `/bookings/{id}/cancel` | Student/Instructor | Cancel a booking |
| PATCH | `/bookings/{id}/confirm` | Instructor | Confirm a pending booking |
| PATCH | `/bookings/{id}/complete` | Instructor | Mark booking as completed |
| GET | `/bookings/my/upcoming` | Student/Instructor | Upcoming bookings |
| GET | `/bookings/my/history` | Student/Instructor | Past bookings |

---

## Workshops  `/api/v1/workshops`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/workshops` | Public | List / search workshops |
| GET | `/workshops/{id}` | Public | Get workshop detail |
| POST | `/workshops` | Instructor | Create a workshop |
| PUT | `/workshops/{id}` | Instructor | Update a workshop |
| DELETE | `/workshops/{id}` | Instructor | Cancel a workshop |
| POST | `/workshops/{id}/register` | Student | Register for a workshop |
| DELETE | `/workshops/{id}/register` | Student | Cancel workshop registration |
| GET | `/workshops/{id}/participants` | Instructor | List registered students |
| GET | `/workshops/my` | Instructor | Instructor's own workshops |

---

## Reviews  `/api/v1/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/reviews` | Student | Create a review (requires COMPLETED booking) |
| GET | `/reviews/instructor/{instructorId}` | Public | Get reviews for an instructor |
| DELETE | `/reviews/{id}` | Student/Admin | Delete a review |
| PATCH | `/reviews/{id}/visibility` | Admin | Hide / show a review |

---

## Notifications  `/api/v1/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | User | Get own notifications |
| PATCH | `/notifications/{id}/read` | User | Mark as read |
| PATCH | `/notifications/read-all` | User | Mark all as read |
| DELETE | `/notifications/{id}` | User | Delete a notification |

---

## Admin  `/api/v1/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Platform analytics summary |
| GET | `/admin/users` | Admin | All users with filters |
| GET | `/admin/bookings` | Admin | All bookings |
| GET | `/admin/reviews` | Admin | Moderation queue |

---

## Standard Response Envelope

```json
{
  "success": true,
  "message": "Booking confirmed",
  "data": { ... },
  "timestamp": "2026-06-27T11:00:00Z"
}
```

Error response:
```json
{
  "success": false,
  "message": "Slot is no longer available",
  "errorCode": "BOOKING_CONFLICT",
  "timestamp": "2026-06-27T11:00:01Z"
}
```

---

## HTTP Status Code Convention

| Code | Used for |
|---|---|
| 200 | Successful GET / PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no body) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, already booked) |
| 422 | Business rule violation |
| 500 | Unexpected server error |
