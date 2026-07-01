package com.dncehub.service;

import com.dncehub.dto.request.BookingRequest;
import com.dncehub.dto.response.BookingResponse;
import com.dncehub.entity.AvailabilitySlot;
import com.dncehub.entity.Booking;
import com.dncehub.entity.StudentProfile;
import com.dncehub.entity.enums.BookingStatus;
import com.dncehub.exception.AppException;
import com.dncehub.exception.ErrorCode;
import com.dncehub.repository.AvailabilitySlotRepository;
import com.dncehub.repository.BookingRepository;
import com.dncehub.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AvailabilitySlotRepository slotRepository;

    public BookingService(BookingRepository bookingRepository,
                          StudentProfileRepository studentProfileRepository,
                          AvailabilitySlotRepository slotRepository) {
        this.bookingRepository = bookingRepository;
        this.studentProfileRepository = studentProfileRepository;
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
    public BookingResponse create(BookingRequest request) {
        StudentProfile student = studentProfileRepository.findByUserId(request.getStudentUserId())
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
    public BookingResponse getById(Long id) {
        return toResponse(findBooking(id));
    }

    @Transactional
    public BookingResponse confirm(Long id) {
        Booking booking = findBooking(id);
        assertStatus(booking, BookingStatus.PENDING);
        booking.setStatus(BookingStatus.CONFIRMED);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse cancel(Long id, String cancelledBy) {
        Booking booking = findBooking(id);
        if (booking.getStatus() == BookingStatus.COMPLETED
                || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledBy(cancelledBy);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse complete(Long id) {
        Booking booking = findBooking(id);
        assertStatus(booking, BookingStatus.CONFIRMED);
        booking.setStatus(BookingStatus.COMPLETED);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUpcoming(Long studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        return bookingRepository.findUpcomingByStudent(
                student.getId(),
                LocalDate.now(),
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        ).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getHistory(Long studentUserId) {
        StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        return bookingRepository.findHistoryByStudent(
                student.getId(),
                LocalDate.now(),
                List.of(BookingStatus.CANCELLED, BookingStatus.COMPLETED)
        ).stream().map(this::toResponse).toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
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
