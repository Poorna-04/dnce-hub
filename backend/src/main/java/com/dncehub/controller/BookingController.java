package com.dncehub.controller;

import com.dncehub.dto.request.BookingRequest;
import com.dncehub.dto.response.ApiResponse;
import com.dncehub.dto.response.BookingResponse;
import com.dncehub.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> create(
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Booking created", bookingService.create(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getById(id)));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking confirmed", bookingService.confirm(id)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(
            @PathVariable Long id,
            @RequestParam String cancelledBy) {
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled", bookingService.cancel(id, cancelledBy)));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<BookingResponse>> complete(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Booking completed", bookingService.complete(id)));
    }

    @GetMapping("/my/upcoming")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> upcoming(
            @RequestParam Long studentUserId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getUpcoming(studentUserId)));
    }

    @GetMapping("/my/history")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> history(
            @RequestParam Long studentUserId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getHistory(studentUserId)));
    }
}
