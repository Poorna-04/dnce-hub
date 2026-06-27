# DanceHub — Database Schema & ER Diagram

## Entity Relationship Overview

```
users ─────────────────────────── roles
  │         (many-to-many via user_roles)
  │
  ├── instructor_profiles  ──────── availability_slots
  │         │                            │
  │         │                       bookings ────── reviews
  │         │                            │
  │         └── workshops ──── workshop_registrations
  │
  └── student_profiles
            │
            └── saved_instructors  (many-to-many)
```

---

## Table Definitions

### users
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| password_hash | VARCHAR(255) | NULLABLE | NULL for OAuth-only accounts |
| full_name | VARCHAR(100) | NOT NULL | |
| profile_picture_url | VARCHAR(500) | | Cloudinary URL |
| oauth_provider | VARCHAR(50) | | GOOGLE, GITHUB, or NULL |
| oauth_provider_id | VARCHAR(255) | | Provider user ID |
| email_verified | BOOLEAN | DEFAULT false | |
| account_status | VARCHAR(20) | DEFAULT 'ACTIVE' | ACTIVE, SUSPENDED, DELETED |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

### roles
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| name | VARCHAR(50) | UNIQUE, NOT NULL | ROLE_STUDENT, ROLE_INSTRUCTOR, ROLE_ADMIN |

### user_roles (join table)
| Column | Type | Constraints |
|---|---|---|
| user_id | BIGINT | FK → users.id |
| role_id | BIGINT | FK → roles.id |

### refresh_tokens
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| token | VARCHAR(500) | UNIQUE, NOT NULL | Hashed token value |
| user_id | BIGINT | FK → users.id | |
| expires_at | TIMESTAMP | NOT NULL | |
| revoked | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMP | DEFAULT now() | |

### instructor_profiles
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| user_id | BIGINT | UNIQUE FK → users.id | One-to-one |
| bio | TEXT | | |
| experience_years | INT | | |
| dance_styles | TEXT[] | | e.g. {Salsa, Bachata} |
| hourly_rate | NUMERIC(10,2) | | |
| city | VARCHAR(100) | | |
| state | VARCHAR(100) | | |
| country | VARCHAR(100) | | |
| languages | TEXT[] | | |
| teaching_mode | VARCHAR(20) | | IN_PERSON, ONLINE, BOTH |
| is_verified | BOOLEAN | DEFAULT false | Admin-verified instructor |
| average_rating | NUMERIC(3,2) | DEFAULT 0.0 | Maintained via triggers/service |
| total_reviews | INT | DEFAULT 0 | |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

### student_profiles
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| user_id | BIGINT | UNIQUE FK → users.id | One-to-one |
| dance_interests | TEXT[] | | e.g. {Hip-Hop, Contemporary} |
| skill_level | VARCHAR(20) | | BEGINNER, INTERMEDIATE, ADVANCED |
| bio | TEXT | | |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

### saved_instructors (join table)
| Column | Type | Constraints |
|---|---|---|
| student_id | BIGINT | FK → student_profiles.id |
| instructor_id | BIGINT | FK → instructor_profiles.id |
| saved_at | TIMESTAMP | DEFAULT now() |

### availability_slots
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| instructor_id | BIGINT | FK → instructor_profiles.id | |
| slot_type | VARCHAR(20) | NOT NULL | RECURRING, ONE_TIME |
| day_of_week | INT | NULLABLE | 1=Mon … 7=Sun (for RECURRING) |
| slot_date | DATE | NULLABLE | For ONE_TIME overrides |
| start_time | TIME | NOT NULL | |
| end_time | TIME | NOT NULL | |
| is_available | BOOLEAN | DEFAULT true | false = blocked day override |
| created_at | TIMESTAMP | DEFAULT now() | |

### bookings
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| student_id | BIGINT | FK → student_profiles.id | |
| instructor_id | BIGINT | FK → instructor_profiles.id | |
| availability_slot_id | BIGINT | FK → availability_slots.id | |
| booking_date | DATE | NOT NULL | |
| start_time | TIME | NOT NULL | |
| end_time | TIME | NOT NULL | |
| status | VARCHAR(20) | DEFAULT 'PENDING' | PENDING, CONFIRMED, CANCELLED, COMPLETED |
| total_amount | NUMERIC(10,2) | | |
| notes | TEXT | | Student's note to instructor |
| cancelled_by | VARCHAR(20) | | STUDENT, INSTRUCTOR |
| cancellation_reason | TEXT | | |
| version | BIGINT | DEFAULT 0 | For optimistic locking |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

### workshops
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| instructor_id | BIGINT | FK → instructor_profiles.id | |
| title | VARCHAR(200) | NOT NULL | |
| description | TEXT | | |
| dance_style | VARCHAR(100) | | |
| poster_url | VARCHAR(500) | | Cloudinary URL |
| venue | VARCHAR(300) | | |
| city | VARCHAR(100) | | |
| is_online | BOOLEAN | DEFAULT false | |
| meeting_link | VARCHAR(500) | | For online workshops |
| workshop_date | DATE | NOT NULL | |
| start_time | TIME | NOT NULL | |
| end_time | TIME | NOT NULL | |
| price | NUMERIC(10,2) | NOT NULL | |
| total_seats | INT | NOT NULL | |
| registered_seats | INT | DEFAULT 0 | |
| status | VARCHAR(20) | DEFAULT 'UPCOMING' | UPCOMING, ONGOING, COMPLETED, CANCELLED |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

### workshop_registrations
| Column | Type | Constraints |
|---|---|---|
| id | BIGSERIAL | PK |
| workshop_id | BIGINT | FK → workshops.id |
| student_id | BIGINT | FK → student_profiles.id |
| payment_status | VARCHAR(20) | DEFAULT 'PENDING' |
| registered_at | TIMESTAMP | DEFAULT now() |

### reviews
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| booking_id | BIGINT | UNIQUE FK → bookings.id | One review per booking |
| student_id | BIGINT | FK → student_profiles.id | |
| instructor_id | BIGINT | FK → instructor_profiles.id | Denormalized for query speed |
| overall_rating | INT | CHECK (1-5) | |
| teaching_rating | INT | CHECK (1-5) | |
| communication_rating | INT | CHECK (1-5) | |
| comment | TEXT | | |
| is_visible | BOOLEAN | DEFAULT true | Admin can hide abusive reviews |
| created_at | TIMESTAMP | DEFAULT now() | |

### notifications
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGSERIAL | PK | |
| user_id | BIGINT | FK → users.id | |
| type | VARCHAR(50) | NOT NULL | BOOKING_CONFIRMED, etc. |
| title | VARCHAR(200) | | |
| message | TEXT | | |
| is_read | BOOLEAN | DEFAULT false | |
| reference_type | VARCHAR(50) | | BOOKING, WORKSHOP, etc. |
| reference_id | BIGINT | | ID of the referenced entity |
| created_at | TIMESTAMP | DEFAULT now() | |

---

## Key Design Decisions

1. **OAuth support**: `password_hash` is nullable so Google/GitHub users never need a password.
2. **Optimistic locking** on `bookings.version` prevents double-booking under concurrent requests.
3. **`availability_slots.slot_type`** distinguishes recurring weekly slots from one-time overrides, so an instructor can block a holiday without deleting their whole schedule.
4. **`reviews.booking_id`** is UNIQUE — a student can only review an instructor once per booking, and the service validates `booking.status = COMPLETED` before allowing a review.
5. **`instructor_profiles.average_rating`** is a denormalized cache updated by the service layer, avoiding expensive AVG queries on every profile load.
