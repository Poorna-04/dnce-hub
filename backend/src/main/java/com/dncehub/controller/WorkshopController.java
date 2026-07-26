package com.dncehub.controller;

import com.dncehub.dto.request.WorkshopRequest;
import com.dncehub.dto.response.ApiResponse;
import com.dncehub.dto.response.WorkshopResponse;
import com.dncehub.security.SecurityUtils;
import com.dncehub.service.WorkshopService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workshops")
public class WorkshopController {

    private final WorkshopService workshopService;

    public WorkshopController(WorkshopService workshopService) {
        this.workshopService = workshopService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkshopResponse>>> list(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String style) {
        return ResponseEntity.ok(ApiResponse.ok(workshopService.listUpcoming(city, style)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<WorkshopResponse>>> myWorkshops() {
        return ResponseEntity.ok(ApiResponse.ok(
                workshopService.getMyWorkshops(SecurityUtils.getCurrentUserId())));
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<ApiResponse<List<WorkshopResponse>>> myRegistrations() {
        return ResponseEntity.ok(ApiResponse.ok(
                workshopService.getMyRegistrations(SecurityUtils.getCurrentUserId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkshopResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(workshopService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkshopResponse>> create(
            @Valid @RequestBody WorkshopRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Workshop created",
                        workshopService.create(SecurityUtils.getCurrentUserId(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkshopResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody WorkshopRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Workshop updated",
                workshopService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        workshopService.cancel(id);
        return ResponseEntity.ok(ApiResponse.ok("Workshop cancelled", null));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<Void>> register(@PathVariable Long id) {
        workshopService.register(id, SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Registered successfully", null));
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<ApiResponse<Void>> cancelRegistration(@PathVariable Long id) {
        workshopService.cancelRegistration(id, SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Registration cancelled", null));
    }
}
