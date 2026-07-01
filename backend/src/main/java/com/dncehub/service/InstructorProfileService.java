package com.dncehub.service;

import com.dncehub.dto.request.InstructorProfileRequest;
import com.dncehub.dto.response.InstructorProfileResponse;
import com.dncehub.entity.InstructorProfile;
import com.dncehub.entity.User;
import com.dncehub.exception.AppException;
import com.dncehub.exception.ErrorCode;
import com.dncehub.repository.InstructorProfileRepository;
import com.dncehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class InstructorProfileService {

    private final InstructorProfileRepository instructorProfileRepository;
    private final UserRepository userRepository;

    public InstructorProfileService(InstructorProfileRepository instructorProfileRepository,
                                    UserRepository userRepository) {
        this.instructorProfileRepository = instructorProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<InstructorProfileResponse> getAllInstructors() {
        return instructorProfileRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InstructorProfileResponse> searchByCity(String city) {
        return instructorProfileRepository.findByCityIgnoreCase(city)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InstructorProfileResponse> searchByStyle(String style) {
        return instructorProfileRepository.findByDanceStylesContainingIgnoreCase(style)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InstructorProfileResponse getById(Long id) {
        InstructorProfile profile = instructorProfileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));
        return toResponse(profile);
    }

    @Transactional
    public InstructorProfileResponse create(InstructorProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (instructorProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new AppException(ErrorCode.PROFILE_ALREADY_EXISTS);
        }

        InstructorProfile profile = InstructorProfile.builder()
                .user(user)
                .experienceYears(request.getExperienceYears())
                .danceStyles(request.getDanceStyles())
                .hourlyRate(request.getHourlyRate())
                .city(request.getCity())
                .teachingMode(request.getTeachingMode())
                .build();

        return toResponse(instructorProfileRepository.save(profile));
    }

    @Transactional
    public InstructorProfileResponse update(Long id, InstructorProfileRequest request) {
        InstructorProfile profile = instructorProfileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));

        profile.setExperienceYears(request.getExperienceYears());
        profile.setDanceStyles(request.getDanceStyles());
        profile.setHourlyRate(request.getHourlyRate());
        profile.setCity(request.getCity());
        profile.setTeachingMode(request.getTeachingMode());

        return toResponse(instructorProfileRepository.save(profile));
    }

    @Transactional
    public void delete(Long id) {
        if (!instructorProfileRepository.existsById(id)) {
            throw new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND);
        }
        instructorProfileRepository.deleteById(id);
    }

    private InstructorProfileResponse toResponse(InstructorProfile profile) {
        return InstructorProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())
                .experienceYears(profile.getExperienceYears())
                .danceStyles(parseDanceStyles(profile.getDanceStyles()))
                .hourlyRate(profile.getHourlyRate())
                .city(profile.getCity())
                .teachingMode(profile.getTeachingMode())
                .build();
    }

    private List<String> parseDanceStyles(String danceStyles) {
        if (danceStyles == null || danceStyles.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(danceStyles.split(","))
                .map(String::trim)
                .toList();
    }
}
