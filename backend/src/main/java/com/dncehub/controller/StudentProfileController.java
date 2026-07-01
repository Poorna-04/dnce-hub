package com.dncehub.controller;

import com.dncehub.dto.request.StudentProfileRequest;
import com.dncehub.dto.response.ApiResponse;
import com.dncehub.dto.response.InstructorProfileResponse;
import com.dncehub.dto.response.StudentProfileResponse;
import com.dncehub.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getProfile(
            @RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getByUserId(userId)));
    }

    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> create(
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Student profile created", studentProfileService.create(request)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> update(
            @RequestParam Long userId,
            @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Student profile updated", studentProfileService.update(userId, request)));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> delete(@RequestParam Long userId) {
        studentProfileService.delete(userId);
        return ResponseEntity.ok(ApiResponse.ok("Student profile deleted", null));
    }

    @PostMapping("/saved-instructors/{instructorId}")
    public ResponseEntity<ApiResponse<Void>> saveInstructor(
            @RequestParam Long userId,
            @PathVariable Long instructorId) {
        studentProfileService.saveInstructor(userId, instructorId);
        return ResponseEntity.ok(ApiResponse.ok("Instructor saved", null));
    }

    @DeleteMapping("/saved-instructors/{instructorId}")
    public ResponseEntity<ApiResponse<Void>> unsaveInstructor(
            @RequestParam Long userId,
            @PathVariable Long instructorId) {
        studentProfileService.unsaveInstructor(userId, instructorId);
        return ResponseEntity.ok(ApiResponse.ok("Instructor removed from saved", null));
    }

    @GetMapping("/saved-instructors")
    public ResponseEntity<ApiResponse<List<InstructorProfileResponse>>> getSavedInstructors(
            @RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(studentProfileService.getSavedInstructors(userId)));
    }
}
