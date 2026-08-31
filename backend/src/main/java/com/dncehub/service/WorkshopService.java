package com.dncehub.service;

import com.dncehub.config.CacheConfig;
import com.dncehub.dto.request.WorkshopRequest;
import com.dncehub.dto.response.RegisteredWorkshopResponse;
import com.dncehub.dto.response.WorkshopRegistrantResponse;
import com.dncehub.dto.response.WorkshopResponse;
import com.dncehub.entity.InstructorProfile;
import com.dncehub.entity.StudentProfile;
import com.dncehub.entity.Workshop;
import com.dncehub.entity.WorkshopRegistration;
import com.dncehub.entity.enums.WorkshopStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import com.dncehub.exception.AppException;
import com.dncehub.exception.ErrorCode;
import com.dncehub.repository.InstructorProfileRepository;
import com.dncehub.repository.StudentProfileRepository;
import com.dncehub.repository.WorkshopRegistrationRepository;
import com.dncehub.repository.WorkshopRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final WorkshopRegistrationRepository registrationRepository;
    private final InstructorProfileRepository instructorRepository;
    private final StudentProfileRepository studentProfileRepository;

    public WorkshopService(WorkshopRepository workshopRepository,
                           WorkshopRegistrationRepository registrationRepository,
                           InstructorProfileRepository instructorRepository,
                           StudentProfileRepository studentProfileRepository) {
        this.workshopRepository = workshopRepository;
        this.registrationRepository = registrationRepository;
        this.instructorRepository = instructorRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    @Cacheable(value = CacheConfig.CACHE_WORKSHOPS,
               key = "'upcoming_' + (#city ?: 'all') + '_' + (#style ?: 'all')")
    @Transactional(readOnly = true)
    public List<WorkshopResponse> listUpcoming(String city, String style) {
        List<Workshop> workshops;
        if (city != null && !city.isBlank()) {
            workshops = workshopRepository.fetchUpcomingByCity(city);
        } else if (style != null && !style.isBlank()) {
            workshops = workshopRepository.fetchUpcomingByStyle(style);
        } else {
            workshops = workshopRepository.fetchUpcoming();
        }
        return workshops.stream().map(this::toPublicResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(value = CacheConfig.CACHE_WORKSHOPS, key = "'id_' + #id")
    @Transactional(readOnly = true)
    public WorkshopResponse getById(Long id) {
        return toPublicResponse(findWorkshop(id));
    }

    @CacheEvict(value = CacheConfig.CACHE_WORKSHOPS, allEntries = true)
    @Transactional
    public WorkshopResponse create(UUID instructorUserId, WorkshopRequest request) {
        InstructorProfile instructor = instructorRepository.findByUserId(instructorUserId)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        Workshop workshop = new Workshop();
        workshop.setInstructor(instructor);
        applyRequest(workshop, request);

        return toResponse(workshopRepository.save(workshop));
    }

    @CacheEvict(value = CacheConfig.CACHE_WORKSHOPS, allEntries = true)
    @Transactional
    public WorkshopResponse update(Long id, UUID instructorUserId, WorkshopRequest request) {
        Workshop workshop = findWorkshop(id);
        assertOwner(workshop, instructorUserId);

        if (workshop.getStatus() == WorkshopStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        applyRequest(workshop, request);
        return toResponse(workshopRepository.save(workshop));
    }

    @CacheEvict(value = CacheConfig.CACHE_WORKSHOPS, allEntries = true)
    @Transactional
    public void cancel(Long id, UUID instructorUserId) {
        Workshop workshop = findWorkshop(id);
        assertOwner(workshop, instructorUserId);
        if (workshop.getStatus() == WorkshopStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }
        workshop.setStatus(WorkshopStatus.CANCELLED);
        workshopRepository.save(workshop);
    }

    /**
     * Register a student for a workshop.
     * registeredSeats is incremented and saved — the @Version field on Workshop
     * acts as an optimistic lock so two concurrent registrations cannot both
     * claim the last seat without one of them failing with a stale-version error.
     */
    @CacheEvict(value = CacheConfig.CACHE_WORKSHOPS, allEntries = true)
    @Transactional
    public void register(Long workshopId, UUID studentUserId) {
        Workshop workshop = findWorkshop(workshopId);

        if (workshop.getStatus() != WorkshopStatus.UPCOMING) {
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }
        if (workshop.getRegisteredSeats() >= workshop.getTotalSeats()) {
            throw new AppException(ErrorCode.WORKSHOP_FULL);
        }

        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        if (registrationRepository.existsByWorkshopIdAndStudentId(workshopId, student.getId())) {
            throw new AppException(ErrorCode.ALREADY_REGISTERED);
        }

        WorkshopRegistration reg = new WorkshopRegistration();
        reg.setWorkshop(workshop);
        reg.setStudent(student);
        registrationRepository.save(reg);

        workshop.setRegisteredSeats(workshop.getRegisteredSeats() + 1);
        workshopRepository.save(workshop);
    }

    @CacheEvict(value = CacheConfig.CACHE_WORKSHOPS, allEntries = true)
    @Transactional
    public void cancelRegistration(Long workshopId, UUID studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        WorkshopRegistration reg = registrationRepository
                .findByWorkshopIdAndStudentId(workshopId, student.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Workshop workshop = findWorkshop(workshopId);
        registrationRepository.delete(reg);

        workshop.setRegisteredSeats(Math.max(0, workshop.getRegisteredSeats() - 1));
        workshopRepository.save(workshop);
    }

    @CacheEvict(value = CacheConfig.CACHE_WORKSHOPS, allEntries = true)
    @Transactional
    public void payWorkshopRegistration(Long workshopId, UUID studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));
        WorkshopRegistration reg = registrationRepository
                .findByWorkshopIdAndStudentId(workshopId, student.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        reg.setPaymentStatus("PAID");
        registrationRepository.save(reg);
    }

    @Transactional(readOnly = true)
    public List<WorkshopRegistrantResponse> getRegistrants(Long workshopId, UUID instructorUserId) {
        Workshop workshop = findWorkshop(workshopId);
        assertOwner(workshop, instructorUserId);

        return registrationRepository.findByWorkshopId(workshopId)
                .stream()
                .map(reg -> WorkshopRegistrantResponse.builder()
                        .studentProfileId(reg.getStudent().getId())
                        .fullName(reg.getStudent().getUser().getFullName())
                        .email(reg.getStudent().getUser().getEmail())
                        .paymentStatus(reg.getPaymentStatus())
                        .registeredAt(reg.getRegisteredAt())
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Transactional
    public List<WorkshopResponse> getMyWorkshops(UUID instructorUserId) {
        syncStaleStatuses();                         // auto-close past workshops first
        InstructorProfile instructor = instructorRepository.findByUserId(instructorUserId)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));

        return workshopRepository
                .findByInstructorIdOrderByWorkshopDateDesc(instructor.getId())
                .stream().map(this::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Transactional
    public List<RegisteredWorkshopResponse> getMyRegistrations(UUID studentUserId) {
        syncStaleStatuses();    // ensure statuses are current before returning
        return registrationRepository.findByStudent_User_Id(studentUserId)
                .stream()
                .map(reg -> {
                    Workshop w = reg.getWorkshop();
                    return RegisteredWorkshopResponse.builder()
                            .id(w.getId())
                            .instructorId(w.getInstructor().getId())
                            .instructorName(w.getInstructor().getUser().getFullName())
                            .title(w.getTitle())
                            .description(w.getDescription())
                            .danceStyle(w.getDanceStyle())
                            .venue(w.getVenue())
                            .city(w.getCity())
                            .online(w.isOnline())
                            .meetingLink(w.getMeetingLink())
                            .workshopDate(w.getWorkshopDate())
                            .startTime(w.getStartTime())
                            .endTime(w.getEndTime())
                            .price(w.getPrice())
                            .totalSeats(w.getTotalSeats())
                            .registeredSeats(w.getRegisteredSeats())
                            .seatsLeft(w.getTotalSeats() - w.getRegisteredSeats())
                            .status(w.getStatus())
                            .paymentStatus(reg.getPaymentStatus())
                            .registeredAt(reg.getRegisteredAt())
                            .build();
                })
                .collect(Collectors.toCollection(ArrayList::new));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    /**
     * Auto-syncs workshop statuses based on current date AND time:
     *
     *  • date < today                          → COMPLETED
     *  • date == today && now > endTime        → COMPLETED
     *  • date == today && now is during window → ONGOING
     *  • date > today (or today but not started) → UPCOMING (no change)
     *
     * Called eagerly before every workshop list endpoint so the DB is always
     * in sync without needing a background scheduler.
     */
    @CacheEvict(value = CacheConfig.CACHE_WORKSHOPS, allEntries = true)
    @Transactional
    public void syncStaleStatuses() {
        LocalDate today = LocalDate.now();
        LocalTime now   = LocalTime.now();

        List<Workshop> active = workshopRepository.findAllByStatusIn(
                List.of(WorkshopStatus.UPCOMING, WorkshopStatus.ONGOING)
        );

        List<Workshop> toUpdate = new ArrayList<>();
        for (Workshop w : active) {
            WorkshopStatus computed = computeWorkshopStatus(w, today, now);
            if (computed != w.getStatus()) {
                w.setStatus(computed);
                toUpdate.add(w);
            }
        }
        if (!toUpdate.isEmpty()) {
            workshopRepository.saveAll(toUpdate);
        }
    }

    /**
     * Pure function — determines what a workshop's status should be right now.
     * Does NOT touch the DB; call syncStaleStatuses() for persistence.
     */
    private WorkshopStatus computeWorkshopStatus(Workshop w, LocalDate today, LocalTime now) {
        LocalDate date  = w.getWorkshopDate();
        LocalTime start = w.getStartTime();
        LocalTime end   = w.getEndTime();

        if (date.isBefore(today)) {
            // Past date → always completed
            return WorkshopStatus.COMPLETED;
        }
        if (date.isEqual(today)) {
            if (now.isAfter(end)) {
                // Today but past end time → completed
                return WorkshopStatus.COMPLETED;
            }
            if (!now.isBefore(start)) {
                // Today and within the window → live
                return WorkshopStatus.ONGOING;
            }
        }
        // Future date, or today but hasn't started yet
        return WorkshopStatus.UPCOMING;
    }

    private Workshop findWorkshop(Long id) {
        return workshopRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORKSHOP_NOT_FOUND));
    }

    private void assertOwner(Workshop workshop, UUID instructorUserId) {
        if (!workshop.getInstructor().getUser().getId().equals(instructorUserId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void applyRequest(Workshop w, WorkshopRequest r) {
        w.setTitle(r.getTitle());
        w.setDescription(r.getDescription());
        w.setDanceStyle(r.getDanceStyle());
        w.setPosterUrl(r.getPosterUrl());
        w.setVenue(r.getVenue());
        w.setCity(r.getCity());
        w.setOnline(r.isOnline());
        w.setMeetingLink(r.getMeetingLink());
        w.setWorkshopDate(r.getWorkshopDate());
        w.setStartTime(r.getStartTime());
        w.setEndTime(r.getEndTime());
        w.setPrice(r.getPrice());
        w.setTotalSeats(r.getTotalSeats());
    }

    private WorkshopResponse toPublicResponse(Workshop w) {
        return toResponse(w, false);
    }

    private WorkshopResponse toResponse(Workshop w) {
        return toResponse(w, true);
    }

    private WorkshopResponse toResponse(Workshop w, boolean includeMeetingLink) {
        return WorkshopResponse.builder()
                .id(w.getId())
                .instructorId(w.getInstructor().getId())
                .instructorName(w.getInstructor().getUser().getFullName())
                .title(w.getTitle())
                .description(w.getDescription())
                .danceStyle(w.getDanceStyle())
                .posterUrl(w.getPosterUrl())
                .venue(w.getVenue())
                .city(w.getCity())
                .online(w.isOnline())
                .meetingLink(includeMeetingLink ? w.getMeetingLink() : null)
                .workshopDate(w.getWorkshopDate())
                .startTime(w.getStartTime())
                .endTime(w.getEndTime())
                .price(w.getPrice())
                .totalSeats(w.getTotalSeats())
                .registeredSeats(w.getRegisteredSeats())
                .seatsLeft(w.getTotalSeats() - w.getRegisteredSeats())
                .status(w.getStatus())
                .version(w.getVersion())
                .createdAt(w.getCreatedAt())
                .build();
    }
}
