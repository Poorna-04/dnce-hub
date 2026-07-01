package com.dncehub.dto.response;

import com.dncehub.entity.enums.SlotType;

import java.time.LocalDate;
import java.time.LocalTime;

public class AvailabilitySlotResponse {

    private Long id;
    private Long instructorId;
    private SlotType slotType;
    private Integer dayOfWeek;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;

    public Long getId() { return id; }
    public Long getInstructorId() { return instructorId; }
    public SlotType getSlotType() { return slotType; }
    public Integer getDayOfWeek() { return dayOfWeek; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public boolean isAvailable() { return available; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long instructorId;
        private SlotType slotType;
        private Integer dayOfWeek;
        private LocalDate slotDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private boolean available;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder instructorId(Long v) { this.instructorId = v; return this; }
        public Builder slotType(SlotType v) { this.slotType = v; return this; }
        public Builder dayOfWeek(Integer v) { this.dayOfWeek = v; return this; }
        public Builder slotDate(LocalDate v) { this.slotDate = v; return this; }
        public Builder startTime(LocalTime v) { this.startTime = v; return this; }
        public Builder endTime(LocalTime v) { this.endTime = v; return this; }
        public Builder available(boolean v) { this.available = v; return this; }

        public AvailabilitySlotResponse build() {
            AvailabilitySlotResponse r = new AvailabilitySlotResponse();
            r.id = this.id;
            r.instructorId = this.instructorId;
            r.slotType = this.slotType;
            r.dayOfWeek = this.dayOfWeek;
            r.slotDate = this.slotDate;
            r.startTime = this.startTime;
            r.endTime = this.endTime;
            r.available = this.available;
            return r;
        }
    }
}
