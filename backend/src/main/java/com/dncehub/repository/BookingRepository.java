package com.dncehub.repository;

import com.dncehub.entity.Booking;
import com.dncehub.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Upcoming: bookingDate >= today AND status is PENDING or CONFIRMED
    @Query("""
            SELECT b FROM Booking b
            WHERE b.student.id = :studentId
              AND b.bookingDate >= :today
              AND b.status IN :statuses
            ORDER BY b.bookingDate ASC
            """)
    List<Booking> findUpcomingByStudent(
            @Param("studentId") Long studentId,
            @Param("today") LocalDate today,
            @Param("statuses") List<BookingStatus> statuses
    );

    // History: bookingDate < today OR status is CANCELLED or COMPLETED
    @Query("""
            SELECT b FROM Booking b
            WHERE b.student.id = :studentId
              AND (b.bookingDate < :today OR b.status IN :statuses)
            ORDER BY b.bookingDate DESC
            """)
    List<Booking> findHistoryByStudent(
            @Param("studentId") Long studentId,
            @Param("today") LocalDate today,
            @Param("statuses") List<BookingStatus> statuses
    );

    // Double-booking guard: same slot + same date + active status
    @Query("""
            SELECT b FROM Booking b
            WHERE b.slot.id = :slotId
              AND b.bookingDate = :bookingDate
              AND b.status IN ('PENDING', 'CONFIRMED')
            """)
    List<Booking> findActiveOnSlotAndDate(
            @Param("slotId") Long slotId,
            @Param("bookingDate") LocalDate bookingDate
    );
}
