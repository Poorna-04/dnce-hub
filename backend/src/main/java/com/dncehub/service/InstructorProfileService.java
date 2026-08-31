package com.dncehub.service;

import com.dncehub.config.CacheConfig;
import com.dncehub.dto.request.InstructorProfileRequest;
import com.dncehub.dto.response.InstructorProfileResponse;
import com.dncehub.entity.InstructorProfile;
import com.dncehub.entity.User;
import com.dncehub.exception.AppException;
import com.dncehub.exception.ErrorCode;
import com.dncehub.repository.InstructorProfileRepository;
import com.dncehub.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InstructorProfileService {

    private final InstructorProfileRepository instructorProfileRepository;
    private final UserRepository userRepository;

    public InstructorProfileService(InstructorProfileRepository instructorProfileRepository,
                                    UserRepository userRepository) {
        this.instructorProfileRepository = instructorProfileRepository;
        this.userRepository = userRepository;
    }

    @Cacheable(value = CacheConfig.CACHE_INSTRUCTORS, key = "'all'")
    @Transactional(readOnly = true)
    public List<InstructorProfileResponse> getAllInstructors() {
        return instructorProfileRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(value = CacheConfig.CACHE_INSTRUCTORS, key = "'city_' + #city.toLowerCase()")
    @Transactional(readOnly = true)
    public List<InstructorProfileResponse> searchByCity(String city) {
        return instructorProfileRepository.findByCityIgnoreCase(city)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(value = CacheConfig.CACHE_INSTRUCTORS, key = "'style_' + #style.toLowerCase()")
    @Transactional(readOnly = true)
    public List<InstructorProfileResponse> searchByStyle(String style) {
        return instructorProfileRepository.findByDanceStylesContainingIgnoreCase(style)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(value = CacheConfig.CACHE_INSTRUCTORS, key = "'id_' + #id")
    @Transactional(readOnly = true)
    public InstructorProfileResponse getById(Long id) {
        InstructorProfile profile = instructorProfileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public InstructorProfileResponse getByUserId(UUID userId) {
        InstructorProfile profile = instructorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));
        return toResponse(profile);
    }

    @CacheEvict(value = CacheConfig.CACHE_INSTRUCTORS, allEntries = true)
    @Transactional
    public InstructorProfileResponse create(UUID userId, InstructorProfileRequest request) {
        User user = userRepository.findById(userId)
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

    @CacheEvict(value = CacheConfig.CACHE_INSTRUCTORS, allEntries = true)
    @Transactional
    public InstructorProfileResponse update(UUID userId, InstructorProfileRequest request) {
        InstructorProfile profile = findByUserId(userId);
        applyRequest(profile, request);
        return toResponse(instructorProfileRepository.save(profile));
    }

    @CacheEvict(value = CacheConfig.CACHE_INSTRUCTORS, allEntries = true)
    @Transactional
    public InstructorProfileResponse update(Long id, UUID userId, InstructorProfileRequest request) {
        InstructorProfile profile = findOwnedById(id, userId);
        applyRequest(profile, request);
        return toResponse(instructorProfileRepository.save(profile));
    }

    @CacheEvict(value = CacheConfig.CACHE_INSTRUCTORS, allEntries = true)
    @Transactional
    public void delete(UUID userId) {
        instructorProfileRepository.delete(findByUserId(userId));
    }

    @CacheEvict(value = CacheConfig.CACHE_INSTRUCTORS, allEntries = true)
    @Transactional
    public void delete(Long id, UUID userId) {
        instructorProfileRepository.delete(findOwnedById(id, userId));
    }

    private InstructorProfile findByUserId(UUID userId) {
        return instructorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));
    }

    private InstructorProfile findOwnedById(Long id, UUID userId) {
        InstructorProfile profile = instructorProfileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));
        if (!profile.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        return profile;
    }

    private void applyRequest(InstructorProfile profile, InstructorProfileRequest request) {
        profile.setExperienceYears(request.getExperienceYears());
        profile.setDanceStyles(request.getDanceStyles());
        profile.setHourlyRate(request.getHourlyRate());
        profile.setCity(request.getCity());
        profile.setTeachingMode(request.getTeachingMode());
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
                .collect(Collectors.toCollection(ArrayList::new));
    }
}
