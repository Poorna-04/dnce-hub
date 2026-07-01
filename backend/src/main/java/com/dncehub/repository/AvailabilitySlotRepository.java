package com.dncehub.repository;

import com.dncehub.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {

    List<AvailabilitySlot> findByInstructorId(Long instructorId);

    // Detect time overlap for a given instructor (excluding a slot when updating)
    @Query("""
            SELECT s FROM AvailabilitySlot s
            WHERE s.instructor.id = :instructorId
              AND s.id <> :excludeId
              AND s.startTime < :endTime
              AND s.endTime   > :startTime
            """)
    List<AvailabilitySlot> findOverlapping(
            @Param("instructorId") Long instructorId,
            @Param("excludeId") Long excludeId,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
}
