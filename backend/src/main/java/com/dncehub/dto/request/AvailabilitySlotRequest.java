package com.dncehub.dto.request;

import com.dncehub.entity.enums.SlotType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class AvailabilitySlotRequest {

    @NotNull(message = "slotType is required")
    private SlotType slotType;

    // Required when slotType = RECURRING (1=Mon … 7=Sun)
    private Integer dayOfWeek;

    // Required when slotType = ONE_TIME
    private LocalDate slotDate;

    @NotNull(message = "startTime is required")
    private LocalTime startTime;

    @NotNull(message = "endTime is required")
    private LocalTime endTime;

    private boolean available = true;

    public SlotType getSlotType() { return slotType; }
    public Integer getDayOfWeek() { return dayOfWeek; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public boolean isAvailable() { return available; }

    public void setSlotType(SlotType slotType) { this.slotType = slotType; }
    public void setDayOfWeek(Integer dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public void setSlotDate(LocalDate slotDate) { this.slotDate = slotDate; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setAvailable(boolean available) { this.available = available; }
}
