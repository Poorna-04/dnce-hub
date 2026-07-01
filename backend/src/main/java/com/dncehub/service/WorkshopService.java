package com.dncehub.service;

import com.dncehub.dto.request.WorkshopRequest;
import com.dncehub.dto.response.WorkshopResponse;
import com.dncehub.entity.InstructorProfile;
import com.dncehub.entity.StudentProfile;
import com.dncehub.entity.Workshop;
import com.dncehub.entity.WorkshopRegistration;
import com.dncehub.entity.enums.WorkshopStatus;
import com.dncehub.exception.AppException;
import com.dncehub.exception.ErrorCode;
import com.dncehub.repository.InstructorProfileRepository;
import com.dncehub.repository.StudentProfileRepository;
import com.dncehub.repository.WorkshopRegistrationRepository;
import com.dncehub.repository.WorkshopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    @Transactional(readOnly = true)
    public List<WorkshopResponse> listUpcoming(String city, String style) {
        return workshopRepository.findUpcoming(city, style)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public WorkshopResponse getById(Long id) {
        return toResponse(findWorkshop(id));
    }

    @Transactional
    public WorkshopResponse create(WorkshopRequest request) {
        InstructorProfile instructor = instructorRepository.findByUserId(request.getInstructorUserId())
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        Workshop workshop = new Workshop();
        workshop.setInstructor(instructor);
        applyRequest(workshop, request);

        return toResponse(workshopRepository.save(workshop));
    }

    @Transactional
    public WorkshopResponse update(Long id, WorkshopRequest request) {
        Workshop workshop = findWorkshop(id);

        if (workshop.getStatus() == WorkshopStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        applyRequest(workshop, request);
        return toResponse(workshopRepository.save(workshop));
    }

    @Transactional
    public void cancel(Long id) {
        Workshop workshop = findWorkshop(id);
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
    @Transactional
    public void register(Long workshopId, Long studentUserId) {
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

    @Transactional
    public void cancelRegistration(Long workshopId, Long studentUserId) {
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

    @Transactional(readOnly = true)
    public List<WorkshopResponse> getMyWorkshops(Long instructorUserId) {
        InstructorProfile instructor = instructorRepository.findByUserId(instructorUserId)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));

        return workshopRepository
                .findByInstructorIdOrderByWorkshopDateDesc(instructor.getId())
                .stream().map(this::toResponse).toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Workshop findWorkshop(Long id) {
        return workshopRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORKSHOP_NOT_FOUND));
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

    private WorkshopResponse toResponse(Workshop w) {
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
                .meetingLink(w.getMeetingLink())
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
