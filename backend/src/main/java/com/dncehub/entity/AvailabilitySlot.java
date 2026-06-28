package com.dncehub.entity;

import com.dncehub.entity.enums.SlotType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private InstructorProfile instructor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotType slotType;

    // 1 = Monday … 7 = Sunday. NULL when slotType = ONE_TIME
    private Integer dayOfWeek;

    // NULL when slotType = RECURRING
    private LocalDate slotDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    @Builder.Default
    private boolean available = true;
}
