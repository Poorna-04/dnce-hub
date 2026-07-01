package com.dncehub.controller;

import com.dncehub.dto.request.InstructorProfileRequest;
import com.dncehub.dto.response.ApiResponse;
import com.dncehub.dto.response.InstructorProfileResponse;
import com.dncehub.service.InstructorProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructors")
public class InstructorProfileController {

    private final InstructorProfileService instructorProfileService;//dto

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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InstructorProfileResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(instructorProfileService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InstructorProfileResponse>> create(
            @Valid @RequestBody InstructorProfileRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Instructor profile created", instructorProfileService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InstructorProfileResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InstructorProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Instructor profile updated", instructorProfileService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        instructorProfileService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Instructor profile deleted", null));
    }
}
