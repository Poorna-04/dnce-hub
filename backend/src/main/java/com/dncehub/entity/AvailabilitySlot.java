package com.dncehub.entity;

import com.dncehub.entity.enums.SlotType;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_slots")
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
    private boolean available = true;

    public AvailabilitySlot() {}

    public Long getId() { return id; }
    public InstructorProfile getInstructor() { return instructor; }
    public SlotType getSlotType() { return slotType; }
    public Integer getDayOfWeek() { return dayOfWeek; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public boolean isAvailable() { return available; }

    public void setInstructor(InstructorProfile instructor) { this.instructor = instructor; }
    public void setSlotType(SlotType slotType) { this.slotType = slotType; }
    public void setDayOfWeek(Integer dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public void setSlotDate(LocalDate slotDate) { this.slotDate = slotDate; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setAvailable(boolean available) { this.available = available; }
}
