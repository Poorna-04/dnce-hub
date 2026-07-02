package com.dncehub.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class BookingRequest {

    // Temporary until auth — replaced by JWT principal later
    @NotNull(message = "studentUserId is required")
    private UUID studentUserId;

    @NotNull(message = "slotId is required")
    private Long slotId;

    @NotNull(message = "bookingDate is required")
    private LocalDate bookingDate;

    public UUID getStudentUserId() { return studentUserId; }
    public Long getSlotId() { return slotId; }
    public LocalDate getBookingDate() { return bookingDate; }

    public void setStudentUserId(UUID studentUserId) { this.studentUserId = studentUserId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
}
