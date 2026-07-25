package com.dncehub.repository;

import com.dncehub.entity.AvailabilitySlot;
import com.dncehub.entity.enums.SlotType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {

    List<AvailabilitySlot> findByInstructorId(Long instructorId);

    // Detect time overlap for a given instructor, type-aware:
    // RECURRING slots only conflict with RECURRING on the same dayOfWeek.
    // ONE_TIME slots only conflict with ONE_TIME on the same slotDate.
    @Query("""
            SELECT s FROM AvailabilitySlot s
            WHERE s.instructor.id = :instructorId
              AND s.id           <> :excludeId
              AND s.startTime     < :endTime
              AND s.endTime       > :startTime
              AND s.slotType      = :slotType
              AND (
                  (:slotType = com.dncehub.entity.enums.SlotType.RECURRING AND s.dayOfWeek = :dayOfWeek)
                  OR
                  (:slotType = com.dncehub.entity.enums.SlotType.ONE_TIME   AND s.slotDate  = :slotDate)
              )
            """)
    List<AvailabilitySlot> findOverlapping(
            @Param("instructorId") Long instructorId,
            @Param("excludeId")   Long excludeId,
            @Param("startTime")   LocalTime startTime,
            @Param("endTime")     LocalTime endTime,
            @Param("slotType")    SlotType slotType,
            @Param("dayOfWeek")   Integer dayOfWeek,
            @Param("slotDate")    LocalDate slotDate
    );
}
