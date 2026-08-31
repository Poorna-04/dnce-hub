package com.dncehub.service;

import com.dncehub.dto.request.BookingRequest;
import com.dncehub.dto.response.BookingResponse;
import com.dncehub.entity.AvailabilitySlot;
import com.dncehub.entity.Booking;
import com.dncehub.entity.StudentProfile;
import com.dncehub.entity.enums.BookingStatus;
import com.dncehub.exception.AppException;
import com.dncehub.exception.ErrorCode;
import com.dncehub.entity.InstructorProfile;
import com.dncehub.repository.AvailabilitySlotRepository;
import com.dncehub.repository.BookingRepository;
import com.dncehub.repository.InstructorProfileRepository;
import com.dncehub.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final InstructorProfileRepository instructorProfileRepository;
    private final AvailabilitySlotRepository slotRepository;

    public BookingService(BookingRepository bookingRepository,
                          StudentProfileRepository studentProfileRepository,
                          InstructorProfileRepository instructorProfileRepository,
                          AvailabilitySlotRepository slotRepository) {
        this.bookingRepository = bookingRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.instructorProfileRepository = instructorProfileRepository;
        this.slotRepository = slotRepository;
    }

    /**
     * Create a booking with an optimistic-locking double-booking guard.
     *
     * The @Version field on Booking ensures that if two requests race to book
     * the same slot+date simultaneously, one will succeed and the other will
     * get an ObjectOptimisticLockingFailureException which the caller can retry.
     * The findActiveOnSlotAndDate check is a second, application-level guard.
     */
    @Transactional
    public BookingResponse create(UUID studentUserId, BookingRequest request) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        AvailabilitySlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));

        if (!slot.isAvailable()) {
            throw new AppException(ErrorCode.BOOKING_CONFLICT);
        }

        // Double-booking guard: reject if an active booking already exists for this slot+date
        List<Booking> existing = bookingRepository.findActiveOnSlotAndDate(
                slot.getId(), request.getBookingDate());
        if (!existing.isEmpty()) {
            throw new AppException(ErrorCode.BOOKING_CONFLICT);
        }

        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setInstructor(slot.getInstructor());
        booking.setSlot(slot);
        booking.setBookingDate(request.getBookingDate());
        booking.setTotalAmount(slot.getInstructor().getHourlyRate());

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public BookingResponse getById(Long id, UUID userId) {
        Booking booking = findBooking(id);
        assertParty(booking, userId);
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse confirm(Long id, UUID userId) {
        Booking booking = findBooking(id);
        assertInstructor(booking, userId);
        assertStatus(booking, BookingStatus.PENDING);
        booking.setStatus(BookingStatus.CONFIRMED);
        return toResponse(bookingRepository.save(booking));
    }

    /** Simulates student payment — moves booking from PENDING → CONFIRMED */
    @Transactional
    public BookingResponse pay(Long id, UUID userId) {
        Booking booking = findBooking(id);
        assertStudent(booking, userId);
        assertStatus(booking, BookingStatus.PENDING);
        booking.setStatus(BookingStatus.CONFIRMED);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse cancel(Long id, UUID userId, String cancelledBy) {
        Booking booking = findBooking(id);
        assertParty(booking, userId);
        if (booking.getStatus() == BookingStatus.COMPLETED
                || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledBy(cancelledBy);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse complete(Long id, UUID userId) {
        Booking booking = findBooking(id);
        assertInstructor(booking, userId);
        assertStatus(booking, BookingStatus.CONFIRMED);
        booking.setStatus(BookingStatus.COMPLETED);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public List<BookingResponse> getUpcoming(UUID studentUserId) {
        syncStaleBookings();
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        return bookingRepository.findUpcomingByStudent(
                student.getId(), LocalDate.now(),
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        ).stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<BookingResponse> getHistory(UUID studentUserId) {
        syncStaleBookings();
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        return bookingRepository.findHistoryByStudent(
                student.getId(), LocalDate.now(),
                List.of(BookingStatus.CANCELLED, BookingStatus.COMPLETED)
        ).stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<BookingResponse> getUpcomingForInstructor(UUID instructorUserId) {
        syncStaleBookings();
        InstructorProfile instructor = instructorProfileRepository.findByUserId(instructorUserId)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));

        return bookingRepository.findUpcomingByInstructor(
                instructor.getId(), LocalDate.now(),
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        ).stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<BookingResponse> getHistoryForInstructor(UUID instructorUserId) {
        syncStaleBookings();
        InstructorProfile instructor = instructorProfileRepository.findByUserId(instructorUserId)
                .orElseThrow(() -> new AppException(ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND));

        return bookingRepository.findHistoryByInstructor(
                instructor.getId(), LocalDate.now(),
                List.of(BookingStatus.CANCELLED, BookingStatus.COMPLETED)
        ).stream().map(this::toResponse).toList();
    }

    /**
     * Auto-marks past bookings (bookingDate < today, still PENDING or CONFIRMED)
     * as COMPLETED. Called before every list query so status is always accurate.
     */
    @Transactional
    public void syncStaleBookings() {
        List<Booking> stale = bookingRepository.findPastActive(
                LocalDate.now(),
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        );
        if (!stale.isEmpty()) {
            stale.forEach(b -> b.setStatus(BookingStatus.COMPLETED));
            bookingRepository.saveAll(stale);
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
    }

    private void assertParty(Booking booking, UUID userId) {
        if (!isStudent(booking, userId) && !isInstructor(booking, userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void assertInstructor(Booking booking, UUID userId) {
        if (!isInstructor(booking, userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void assertStudent(Booking booking, UUID userId) {
        if (!isStudent(booking, userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private boolean isStudent(Booking booking, UUID userId) {
        return booking.getStudent().getUser().getId().equals(userId);
    }

    private boolean isInstructor(Booking booking, UUID userId) {
        return booking.getInstructor().getUser().getId().equals(userId);
    }

    private void assertStatus(Booking booking, BookingStatus required) {
        if (booking.getStatus() != required) {
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .studentId(b.getStudent().getId())
                .studentName(b.getStudent().getUser().getFullName())
                .studentEmail(b.getStudent().getUser().getEmail())
                .instructorId(b.getInstructor().getId())
                .instructorName(b.getInstructor().getUser().getFullName())
                .slotId(b.getSlot().getId())
                .bookingDate(b.getBookingDate())
                .startTime(b.getSlot().getStartTime())
                .endTime(b.getSlot().getEndTime())
                .status(b.getStatus())
                .totalAmount(b.getTotalAmount())
                .cancelledBy(b.getCancelledBy())
                .version(b.getVersion())
                .build();
    }
}
