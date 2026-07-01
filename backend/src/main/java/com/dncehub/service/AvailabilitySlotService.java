package com.dncehub.service;

import com.dncehub.dto.request.AvailabilitySlotRequest;
import com.dncehub.dto.response.AvailabilitySlotResponse;
import com.dncehub.entity.AvailabilitySlot;
import com.dncehub.entity.InstructorProfile;
import com.dncehub.entity.enums.SlotType;
import com.dncehub.exception.AppException;
import com.dncehub.exception.ErrorCode;
import com.dncehub.repository.AvailabilitySlotRepository;
import com.dncehub.repository.InstructorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AvailabilitySlotService {

    private final AvailabilitySlotRepository slotRepository;
    private final InstructorProfileRepository instructorRepository;

    public AvailabilitySlotService(AvailabilitySlotRepository slotRepository,
                                   InstructorProfileRepository instructorRepository) {
        this.slotRepository = slotRepository;
        this.instructorRepository = instructorRepository;
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> getSlots(Long instructorId) {
        assertInstructorExists(instructorId);
        return slotRepository.findByInstructorId(instructorId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public AvailabilitySlotResponse addSlot(Long instructorId, AvailabilitySlotRequest request) {
        InstructorProfile instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));

        validate(request);
        checkOverlap(instructorId, -1L, request);

        AvailabilitySlot slot = new AvailabilitySlot();
        slot.setInstructor(instructor);
        applyRequest(slot, request);

        return toResponse(slotRepository.save(slot));
    }

    @Transactional
    public AvailabilitySlotResponse updateSlot(Long instructorId, Long slotId, AvailabilitySlotRequest request) {
        AvailabilitySlot slot = getOwnedSlot(instructorId, slotId);

        validate(request);
        checkOverlap(instructorId, slotId, request);

        applyRequest(slot, request);
        return toResponse(slotRepository.save(slot));
    }

    @Transactional
    public void deleteSlot(Long instructorId, Long slotId) {
        AvailabilitySlot slot = getOwnedSlot(instructorId, slotId);
        slotRepository.delete(slot);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void assertInstructorExists(Long instructorId) {
        if (!instructorRepository.existsById(instructorId)) {
            throw new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND);
        }
    }

    private AvailabilitySlot getOwnedSlot(Long instructorId, Long slotId) {
        assertInstructorExists(instructorId);
        AvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));
        if (!slot.getInstructor().getId().equals(instructorId)) {
            throw new AppException(ErrorCode.SLOT_NOT_FOUND);
        }
        return slot;
    }

    private void validate(AvailabilitySlotRequest req) {
        if (req.getSlotType() == SlotType.RECURRING && req.getDayOfWeek() == null) {
            throw new IllegalArgumentException("dayOfWeek is required for RECURRING slots");
        }
        if (req.getSlotType() == SlotType.ONE_TIME && req.getSlotDate() == null) {
            throw new IllegalArgumentException("slotDate is required for ONE_TIME slots");
        }
        if (!req.getStartTime().isBefore(req.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }
    }

    private void checkOverlap(Long instructorId, Long excludeId, AvailabilitySlotRequest req) {
        List<AvailabilitySlot> overlaps = slotRepository.findOverlapping(
                instructorId, excludeId, req.getStartTime(), req.getEndTime());
        if (!overlaps.isEmpty()) {
            throw new AppException(ErrorCode.SLOT_OVERLAP);
        }
    }

    private void applyRequest(AvailabilitySlot slot, AvailabilitySlotRequest req) {
        slot.setSlotType(req.getSlotType());
        slot.setDayOfWeek(req.getSlotType() == SlotType.RECURRING ? req.getDayOfWeek() : null);
        slot.setSlotDate(req.getSlotType() == SlotType.ONE_TIME ? req.getSlotDate() : null);
        slot.setStartTime(req.getStartTime());
        slot.setEndTime(req.getEndTime());
        slot.setAvailable(req.isAvailable());
    }

    private AvailabilitySlotResponse toResponse(AvailabilitySlot slot) {
        return AvailabilitySlotResponse.builder()
                .id(slot.getId())
                .instructorId(slot.getInstructor().getId())
                .slotType(slot.getSlotType())
                .dayOfWeek(slot.getDayOfWeek())
                .slotDate(slot.getSlotDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .available(slot.isAvailable())
                .build();
    }
}
