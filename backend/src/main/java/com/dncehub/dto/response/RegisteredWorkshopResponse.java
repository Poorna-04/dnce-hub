package com.dncehub.dto.response;

import com.dncehub.entity.enums.WorkshopStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** WorkshopResponse + registration-specific fields (paymentStatus, registeredAt) */
public class RegisteredWorkshopResponse {

    private Long id;
    private Long instructorId;
    private String instructorName;
    private String title;
    private String description;
    private String danceStyle;
    private String venue;
    private String city;
    private boolean online;
    private String meetingLink;
    private LocalDate workshopDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal price;
    private Integer totalSeats;
    private Integer registeredSeats;
    private Integer seatsLeft;
    private WorkshopStatus status;
    // Registration-specific
    private String paymentStatus;
    private LocalDateTime registeredAt;

    public Long getId()                { return id; }
    public Long getInstructorId()      { return instructorId; }
    public String getInstructorName()  { return instructorName; }
    public String getTitle()           { return title; }
    public String getDescription()     { return description; }
    public String getDanceStyle()      { return danceStyle; }
    public String getVenue()           { return venue; }
    public String getCity()            { return city; }
    public boolean isOnline()          { return online; }
    public String getMeetingLink()     { return meetingLink; }
    public LocalDate getWorkshopDate() { return workshopDate; }
    public LocalTime getStartTime()    { return startTime; }
    public LocalTime getEndTime()      { return endTime; }
    public BigDecimal getPrice()       { return price; }
    public Integer getTotalSeats()     { return totalSeats; }
    public Integer getRegisteredSeats(){ return registeredSeats; }
    public Integer getSeatsLeft()      { return seatsLeft; }
    public WorkshopStatus getStatus()  { return status; }
    public String getPaymentStatus()   { return paymentStatus; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id; private Long instructorId; private String instructorName;
        private String title; private String description; private String danceStyle;
        private String venue; private String city; private boolean online;
        private String meetingLink; private LocalDate workshopDate;
        private LocalTime startTime; private LocalTime endTime;
        private BigDecimal price; private Integer totalSeats;
        private Integer registeredSeats; private Integer seatsLeft;
        private WorkshopStatus status; private String paymentStatus;
        private LocalDateTime registeredAt;

        public Builder id(Long v)               { this.id = v; return this; }
        public Builder instructorId(Long v)     { this.instructorId = v; return this; }
        public Builder instructorName(String v) { this.instructorName = v; return this; }
        public Builder title(String v)          { this.title = v; return this; }
        public Builder description(String v)    { this.description = v; return this; }
        public Builder danceStyle(String v)     { this.danceStyle = v; return this; }
        public Builder venue(String v)          { this.venue = v; return this; }
        public Builder city(String v)           { this.city = v; return this; }
        public Builder online(boolean v)        { this.online = v; return this; }
        public Builder meetingLink(String v)    { this.meetingLink = v; return this; }
        public Builder workshopDate(LocalDate v){ this.workshopDate = v; return this; }
        public Builder startTime(LocalTime v)   { this.startTime = v; return this; }
        public Builder endTime(LocalTime v)     { this.endTime = v; return this; }
        public Builder price(BigDecimal v)      { this.price = v; return this; }
        public Builder totalSeats(Integer v)    { this.totalSeats = v; return this; }
        public Builder registeredSeats(Integer v){ this.registeredSeats = v; return this; }
        public Builder seatsLeft(Integer v)     { this.seatsLeft = v; return this; }
        public Builder status(WorkshopStatus v) { this.status = v; return this; }
        public Builder paymentStatus(String v)  { this.paymentStatus = v; return this; }
        public Builder registeredAt(LocalDateTime v){ this.registeredAt = v; return this; }

        public RegisteredWorkshopResponse build() {
            RegisteredWorkshopResponse r = new RegisteredWorkshopResponse();
            r.id = id; r.instructorId = instructorId; r.instructorName = instructorName;
            r.title = title; r.description = description; r.danceStyle = danceStyle;
            r.venue = venue; r.city = city; r.online = online; r.meetingLink = meetingLink;
            r.workshopDate = workshopDate; r.startTime = startTime; r.endTime = endTime;
            r.price = price; r.totalSeats = totalSeats;
            r.registeredSeats = registeredSeats; r.seatsLeft = seatsLeft;
            r.status = status; r.paymentStatus = paymentStatus; r.registeredAt = registeredAt;
            return r;
        }
    }
}
