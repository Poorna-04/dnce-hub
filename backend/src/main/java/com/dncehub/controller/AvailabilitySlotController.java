package com.dncehub.controller;

import com.dncehub.dto.request.AvailabilitySlotRequest;
import com.dncehub.dto.response.ApiResponse;
import com.dncehub.dto.response.AvailabilitySlotResponse;
import com.dncehub.service.AvailabilitySlotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<ApiResponse<AvailabilitySlotResponse>> addSlot(
            @PathVariable Long instructorId,
            @Valid @RequestBody AvailabilitySlotRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Slot added", service.addSlot(instructorId, request)));
    }

    @PutMapping("/{slotId}")
    public ResponseEntity<ApiResponse<AvailabilitySlotResponse>> updateSlot(
            @PathVariable Long instructorId,
            @PathVariable Long slotId,
            @Valid @RequestBody AvailabilitySlotRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Slot updated", service.updateSlot(instructorId, slotId, request)));
    }

    @DeleteMapping("/{slotId}")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(
            @PathVariable Long instructorId,
            @PathVariable Long slotId) {
        service.deleteSlot(instructorId, slotId);
        return ResponseEntity.ok(ApiResponse.ok("Slot deleted", null));
    }
}
