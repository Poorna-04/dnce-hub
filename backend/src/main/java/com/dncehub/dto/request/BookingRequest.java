package com.dncehub.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class BookingRequest {

    @NotNull(message = "slotId is required")
    private Long slotId;

    @NotNull(message = "bookingDate is required")
    private LocalDate bookingDate;

    public Long getSlotId() { return slotId; }
    public LocalDate getBookingDate() { return bookingDate; }

    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
}
