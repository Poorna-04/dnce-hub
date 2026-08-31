package com.dncehub.controller;

import com.dncehub.dto.request.BookingRequest;
import com.dncehub.dto.response.ApiResponse;
import com.dncehub.dto.response.BookingResponse;
import com.dncehub.security.SecurityUtils;
import com.dncehub.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> create(
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Booking created",
                        bookingService.create(SecurityUtils.getCurrentUserId(), request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                bookingService.getById(id, SecurityUtils.getCurrentUserId())));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking confirmed",
                bookingService.confirm(id, SecurityUtils.getCurrentUserId())));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PatchMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<BookingResponse>> pay(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Payment successful",
                bookingService.pay(id, SecurityUtils.getCurrentUserId())));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(@PathVariable Long id) {
        // Derive who is cancelling from the JWT role — no query param needed
        String role = SecurityUtils.getCurrentUserRole();
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled",
                bookingService.cancel(id, SecurityUtils.getCurrentUserId(), role)));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<BookingResponse>> complete(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking completed",
                bookingService.complete(id, SecurityUtils.getCurrentUserId())));
    }

    @GetMapping("/my/upcoming")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> upcoming() {
        // SecurityUtils.getCurrentUserRole() already strips "ROLE_" prefix → returns "INSTRUCTOR" or "STUDENT"
        boolean isInstructor = "INSTRUCTOR".equals(SecurityUtils.getCurrentUserRole());
        List<BookingResponse> result = isInstructor
                ? bookingService.getUpcomingForInstructor(SecurityUtils.getCurrentUserId())
                : bookingService.getUpcoming(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/my/history")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> history() {
        boolean isInstructor = "INSTRUCTOR".equals(SecurityUtils.getCurrentUserRole());
        List<BookingResponse> result = isInstructor
                ? bookingService.getHistoryForInstructor(SecurityUtils.getCurrentUserId())
                : bookingService.getHistory(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
