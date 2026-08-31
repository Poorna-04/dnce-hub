package com.dncehub.controller;

import com.dncehub.dto.request.InstructorProfileRequest;
import com.dncehub.dto.response.ApiResponse;
import com.dncehub.dto.response.InstructorProfileResponse;
import com.dncehub.security.SecurityUtils;
import com.dncehub.service.InstructorProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructors")
public class InstructorProfileController {

    private final InstructorProfileService instructorProfileService;

    public InstructorProfileController(InstructorProfileService instructorProfileService) {
        this.instructorProfileService = instructorProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InstructorProfileResponse>>> getAll(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String style) {

        List<InstructorProfileResponse> result;
        if (city != null) {
            result = instructorProfileService.searchByCity(city);
        } else if (style != null) {
            result = instructorProfileService.searchByStyle(style);
        } else {
            result = instructorProfileService.getAllInstructors();
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<InstructorProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.ok(
                instructorProfileService.getByUserId(SecurityUtils.getCurrentUserId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InstructorProfileResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(instructorProfileService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InstructorProfileResponse>> create(
            @Valid @RequestBody InstructorProfileRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Instructor profile created",
                        instructorProfileService.create(SecurityUtils.getCurrentUserId(), request)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<InstructorProfileResponse>> updateMe(
            @Valid @RequestBody InstructorProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Instructor profile updated",
                instructorProfileService.update(SecurityUtils.getCurrentUserId(), request)));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteMe() {
        instructorProfileService.delete(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Instructor profile deleted", null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InstructorProfileResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InstructorProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Instructor profile updated",
                instructorProfileService.update(id, SecurityUtils.getCurrentUserId(), request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        instructorProfileService.delete(id, SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Instructor profile deleted", null));
    }
}
