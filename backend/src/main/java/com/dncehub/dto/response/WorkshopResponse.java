package com.dncehub.dto.response;

import com.dncehub.entity.enums.WorkshopStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class WorkshopResponse {

    private Long id;
    private Long instructorId;
    private String instructorName;
    private String title;
    private String description;
    private String danceStyle;
    private String posterUrl;
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
    private Long version;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public Long getInstructorId() { return instructorId; }
    public String getInstructorName() { return instructorName; }
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
    public Integer getRegisteredSeats() { return registeredSeats; }
    public Integer getSeatsLeft() { return seatsLeft; }
    public WorkshopStatus getStatus() { return status; }
    public Long getVersion() { return version; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long instructorId;
        private String instructorName;
        private String title;
        private String description;
        private String danceStyle;
        private String posterUrl;
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
        private Long version;
        private LocalDateTime createdAt;

        public Builder id(Long v) { this.id = v; return this; }
        public Builder instructorId(Long v) { this.instructorId = v; return this; }
        public Builder instructorName(String v) { this.instructorName = v; return this; }
        public Builder title(String v) { this.title = v; return this; }
        public Builder description(String v) { this.description = v; return this; }
        public Builder danceStyle(String v) { this.danceStyle = v; return this; }
        public Builder posterUrl(String v) { this.posterUrl = v; return this; }
        public Builder venue(String v) { this.venue = v; return this; }
        public Builder city(String v) { this.city = v; return this; }
        public Builder online(boolean v) { this.online = v; return this; }
        public Builder meetingLink(String v) { this.meetingLink = v; return this; }
        public Builder workshopDate(LocalDate v) { this.workshopDate = v; return this; }
        public Builder startTime(LocalTime v) { this.startTime = v; return this; }
        public Builder endTime(LocalTime v) { this.endTime = v; return this; }
        public Builder price(BigDecimal v) { this.price = v; return this; }
        public Builder totalSeats(Integer v) { this.totalSeats = v; return this; }
        public Builder registeredSeats(Integer v) { this.registeredSeats = v; return this; }
        public Builder seatsLeft(Integer v) { this.seatsLeft = v; return this; }
        public Builder status(WorkshopStatus v) { this.status = v; return this; }
        public Builder version(Long v) { this.version = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }

        public WorkshopResponse build() {
            WorkshopResponse r = new WorkshopResponse();
            r.id = this.id; r.instructorId = this.instructorId;
            r.instructorName = this.instructorName; r.title = this.title;
            r.description = this.description; r.danceStyle = this.danceStyle;
            r.posterUrl = this.posterUrl; r.venue = this.venue;
            r.city = this.city; r.online = this.online;
            r.meetingLink = this.meetingLink; r.workshopDate = this.workshopDate;
            r.startTime = this.startTime; r.endTime = this.endTime;
            r.price = this.price; r.totalSeats = this.totalSeats;
            r.registeredSeats = this.registeredSeats; r.seatsLeft = this.seatsLeft;
            r.status = this.status; r.version = this.version;
            r.createdAt = this.createdAt;
            return r;
        }
    }
}
