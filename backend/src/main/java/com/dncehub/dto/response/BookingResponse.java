package com.dncehub.dto.response;

import com.dncehub.entity.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class BookingResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long instructorId;
    private String instructorName;
    private Long slotId;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BookingStatus status;
    private BigDecimal totalAmount;
    private String cancelledBy;
    private Long version;

    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public Long getInstructorId() { return instructorId; }
    public String getInstructorName() { return instructorName; }
    public Long getSlotId() { return slotId; }
    public LocalDate getBookingDate() { return bookingDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public BookingStatus getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getCancelledBy() { return cancelledBy; }
    public Long getVersion() { return version; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long studentId;
        private String studentName;
        private Long instructorId;
        private String instructorName;
        private Long slotId;
        private LocalDate bookingDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private BookingStatus status;
        private BigDecimal totalAmount;
        private String cancelledBy;
        private Long version;

        public Builder id(Long v) { this.id = v; return this; }
        public Builder studentId(Long v) { this.studentId = v; return this; }
        public Builder studentName(String v) { this.studentName = v; return this; }
        public Builder instructorId(Long v) { this.instructorId = v; return this; }
        public Builder instructorName(String v) { this.instructorName = v; return this; }
        public Builder slotId(Long v) { this.slotId = v; return this; }
        public Builder bookingDate(LocalDate v) { this.bookingDate = v; return this; }
        public Builder startTime(LocalTime v) { this.startTime = v; return this; }
        public Builder endTime(LocalTime v) { this.endTime = v; return this; }
        public Builder status(BookingStatus v) { this.status = v; return this; }
        public Builder totalAmount(BigDecimal v) { this.totalAmount = v; return this; }
        public Builder cancelledBy(String v) { this.cancelledBy = v; return this; }
        public Builder version(Long v) { this.version = v; return this; }

        public BookingResponse build() {
            BookingResponse r = new BookingResponse();
            r.id = this.id;
            r.studentId = this.studentId;
            r.studentName = this.studentName;
            r.instructorId = this.instructorId;
            r.instructorName = this.instructorName;
            r.slotId = this.slotId;
            r.bookingDate = this.bookingDate;
            r.startTime = this.startTime;
            r.endTime = this.endTime;
            r.status = this.status;
            r.totalAmount = this.totalAmount;
            r.cancelledBy = this.cancelledBy;
            r.version = this.version;
            return r;
        }
    }
}
