package com.dncehub.service;

import com.dncehub.dto.request.StudentProfileRequest;
import com.dncehub.dto.response.InstructorProfileResponse;
import com.dncehub.dto.response.StudentProfileResponse;
import com.dncehub.entity.InstructorProfile;
import com.dncehub.entity.StudentProfile;
import com.dncehub.entity.User;
import com.dncehub.exception.AppException;
import com.dncehub.exception.ErrorCode;
import com.dncehub.repository.InstructorProfileRepository;
import com.dncehub.repository.StudentProfileRepository;
import com.dncehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final InstructorProfileRepository instructorProfileRepository;

    public StudentProfileService(StudentProfileRepository studentProfileRepository,
                                 UserRepository userRepository,
                                 InstructorProfileRepository instructorProfileRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.instructorProfileRepository = instructorProfileRepository;
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getByUserId(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));
        return toResponse(profile);
    }

    @Transactional
    public StudentProfileResponse create(StudentProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (studentProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new AppException(ErrorCode.PROFILE_ALREADY_EXISTS);
        }

        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setDanceInterests(request.getDanceInterests());
        profile.setBio(request.getBio());

        return toResponse(studentProfileRepository.save(profile));
    }

    @Transactional
    public StudentProfileResponse update(Long userId, StudentProfileRequest request) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        profile.setDanceInterests(request.getDanceInterests());
        profile.setBio(request.getBio());

        return toResponse(studentProfileRepository.save(profile));
    }

    @Transactional
    public void delete(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));
        studentProfileRepository.delete(profile);
    }

    @Transactional
    public void saveInstructor(Long userId, Long instructorId) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        InstructorProfile instructor = instructorProfileRepository.findById(instructorId)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));

        if (!student.getSavedInstructors().contains(instructor)) {
            student.getSavedInstructors().add(instructor);
            studentProfileRepository.save(student);
        }
    }

    @Transactional
    public void unsaveInstructor(Long userId, Long instructorId) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        student.getSavedInstructors().removeIf(i -> i.getId().equals(instructorId));
        studentProfileRepository.save(student);
    }

    @Transactional(readOnly = true)
    public List<InstructorProfileResponse> getSavedInstructors(Long userId) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        return student.getSavedInstructors().stream()
                .map(this::toInstructorResponse)
                .toList();
    }

    private StudentProfileResponse toResponse(StudentProfile profile) {
        return StudentProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())
                .danceInterests(parseInterests(profile.getDanceInterests()))
                .bio(profile.getBio())
                .build();
    }

    private InstructorProfileResponse toInstructorResponse(InstructorProfile profile) {
        return InstructorProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())
                .experienceYears(profile.getExperienceYears())
                .danceStyles(parseList(profile.getDanceStyles()))
                .hourlyRate(profile.getHourlyRate())
                .city(profile.getCity())
                .teachingMode(profile.getTeachingMode())
                .build();
    }

    private List<String> parseInterests(String value) {
        if (value == null || value.isBlank()) return Collections.emptyList();
        return Arrays.stream(value.split(",")).map(String::trim).toList();
    }

    private List<String> parseList(String value) {
        if (value == null || value.isBlank()) return Collections.emptyList();
        return Arrays.stream(value.split(",")).map(String::trim).toList();
    }
}
