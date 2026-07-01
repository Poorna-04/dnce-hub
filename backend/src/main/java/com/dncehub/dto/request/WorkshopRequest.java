package com.dncehub.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class WorkshopRequest {

    // Temporary until auth — replaced by JWT principal later
    @NotNull(message = "instructorUserId is required")
    private Long instructorUserId;

    @NotBlank(message = "title is required")
    private String title;

    private String description;

    @NotBlank(message = "danceStyle is required")
    private String danceStyle;

    private String posterUrl;
    private String venue;
    private String city;
    private boolean online = false;
    private String meetingLink;

    @NotNull(message = "workshopDate is required")
    private LocalDate workshopDate;

    @NotNull(message = "startTime is required")
    private LocalTime startTime;

    @NotNull(message = "endTime is required")
    private LocalTime endTime;

    @NotNull(message = "price is required")
    @DecimalMin(value = "0.0", message = "price must be >= 0")
    private BigDecimal price;

    @NotNull(message = "totalSeats is required")
    @Min(value = 1, message = "totalSeats must be at least 1")
    private Integer totalSeats;

    public Long getInstructorUserId() { return instructorUserId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getDanceStyle() { return danceStyle; }
    public String getPosterUrl() { return posterUrl; }
    public String getVenue() { return venue; }
    public String getCity() { return city; }
    public boolean isOnline() { return online; }
    public String getMeetingLink() { return meetingLink; }
    public LocalDate getWorkshopDate() { return workshopDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public BigDecimal getPrice() { return price; }
    public Integer getTotalSeats() { return totalSeats; }

    public void setInstructorUserId(Long v) { this.instructorUserId = v; }
    public void setTitle(String v) { this.title = v; }
    public void setDescription(String v) { this.description = v; }
    public void setDanceStyle(String v) { this.danceStyle = v; }
    public void setPosterUrl(String v) { this.posterUrl = v; }
    public void setVenue(String v) { this.venue = v; }
    public void setCity(String v) { this.city = v; }
    public void setOnline(boolean v) { this.online = v; }
    public void setMeetingLink(String v) { this.meetingLink = v; }
    public void setWorkshopDate(LocalDate v) { this.workshopDate = v; }
    public void setStartTime(LocalTime v) { this.startTime = v; }
    public void setEndTime(LocalTime v) { this.endTime = v; }
    public void setPrice(BigDecimal v) { this.price = v; }
    public void setTotalSeats(Integer v) { this.totalSeats = v; }
}
