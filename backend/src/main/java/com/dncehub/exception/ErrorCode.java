package com.dncehub.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    // User
    USER_NOT_FOUND("User not found", HttpStatus.NOT_FOUND),

    // Profiles
    INSTRUCTOR_PROFILE_NOT_FOUND("Instructor profile not found", HttpStatus.NOT_FOUND),
    STUDENT_PROFILE_NOT_FOUND("Student profile not found", HttpStatus.NOT_FOUND),
    PROFILE_ALREADY_EXISTS("Profile already exists for this user", HttpStatus.CONFLICT),

    // Availability
    SLOT_NOT_FOUND("Availability slot not found", HttpStatus.NOT_FOUND),
    SLOT_OVERLAP("This slot overlaps with an existing slot", HttpStatus.CONFLICT),

    // Booking
    BOOKING_NOT_FOUND("Booking not found", HttpStatus.NOT_FOUND),
    BOOKING_CONFLICT("This slot is no longer available", HttpStatus.CONFLICT),
    BOOKING_INVALID_STATUS("Invalid booking status transition", HttpStatus.UNPROCESSABLE_ENTITY),

    // Workshop
    WORKSHOP_NOT_FOUND("Workshop not found", HttpStatus.NOT_FOUND),
    WORKSHOP_FULL("Workshop is fully booked", HttpStatus.CONFLICT),
    ALREADY_REGISTERED("Already registered for this workshop", HttpStatus.CONFLICT),

    // Auth
    INVALID_TOKEN("Invalid or expired token", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("Access denied", HttpStatus.FORBIDDEN),

    // Generic
    INTERNAL_ERROR("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String message;
    private final HttpStatus status;

    ErrorCode(String message, HttpStatus status) {
        this.message = message;
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
