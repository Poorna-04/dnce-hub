package com.dncehub.controller;

import com.dncehub.dto.request.StudentProfileRequest;
import com.dncehub.dto.response.ApiResponse;
import com.dncehub.dto.response.InstructorProfileResponse;
import com.dncehub.dto.response.StudentProfileResponse;
import com.dncehub.security.SecurityUtils;
import com.dncehub.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@PreAuthorize("hasRole('STUDENT')")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getProfile() {
        return ResponseEntity.ok(ApiResponse.ok(
                studentProfileService.getByUserId(SecurityUtils.getCurrentUserId())));
    }

    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> create(
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Student profile created",
                        studentProfileService.create(SecurityUtils.getCurrentUserId(), request)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> update(
            @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Student profile updated",
                studentProfileService.update(SecurityUtils.getCurrentUserId(), request)));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> delete() {
        studentProfileService.delete(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Student profile deleted", null));
    }

    @PostMapping("/saved-instructors/{instructorId}")
    public ResponseEntity<ApiResponse<Void>> saveInstructor(@PathVariable Long instructorId) {
        studentProfileService.saveInstructor(SecurityUtils.getCurrentUserId(), instructorId);
        return ResponseEntity.ok(ApiResponse.ok("Instructor saved", null));
    }

    @DeleteMapping("/saved-instructors/{instructorId}")
    public ResponseEntity<ApiResponse<Void>> unsaveInstructor(@PathVariable Long instructorId) {
        studentProfileService.unsaveInstructor(SecurityUtils.getCurrentUserId(), instructorId);
        return ResponseEntity.ok(ApiResponse.ok("Instructor removed from saved", null));
    }

    @GetMapping("/saved-instructors")
    public ResponseEntity<ApiResponse<List<InstructorProfileResponse>>> getSavedInstructors() {
        return ResponseEntity.ok(ApiResponse.ok(
                studentProfileService.getSavedInstructors(SecurityUtils.getCurrentUserId())));
    }
}
