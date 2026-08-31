package com.dncehub.controller;

import com.dncehub.dto.request.AvailabilitySlotRequest;
import com.dncehub.dto.response.ApiResponse;
import com.dncehub.dto.response.AvailabilitySlotResponse;
import com.dncehub.security.SecurityUtils;
import com.dncehub.service.AvailabilitySlotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructors/{instructorId}/availability")
public class AvailabilitySlotController {

    private final AvailabilitySlotService service;

    public AvailabilitySlotController(AvailabilitySlotService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AvailabilitySlotResponse>>> getSlots(
            @PathVariable Long instructorId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getSlots(instructorId)));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping
    public ResponseEntity<ApiResponse<AvailabilitySlotResponse>> addSlot(
            @Valid @RequestBody AvailabilitySlotRequest request) {
        // Path instructorId is ignored for writes — slots always attach to the caller.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Slot added",
                        service.addSlot(SecurityUtils.getCurrentUserId(), request)));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/{slotId}")
    public ResponseEntity<ApiResponse<AvailabilitySlotResponse>> updateSlot(
            @PathVariable Long slotId,
            @Valid @RequestBody AvailabilitySlotRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Slot updated",
                service.updateSlot(SecurityUtils.getCurrentUserId(), slotId, request)));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @DeleteMapping("/{slotId}")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable Long slotId) {
        service.deleteSlot(SecurityUtils.getCurrentUserId(), slotId);
        return ResponseEntity.ok(ApiResponse.ok("Slot deleted", null));
    }
}
