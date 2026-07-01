package com.dncehub.entity;

import com.dncehub.entity.enums.WorkshopStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "workshops")
public class Workshop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private InstructorProfile instructor;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String danceStyle;
    private String posterUrl;
    private String venue;
    private String city;
    private boolean online = false;
    private String meetingLink;

    @Column(nullable = false)
    private LocalDate workshopDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Integer registeredSeats = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkshopStatus status = WorkshopStatus.UPCOMING;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Workshop() {}

    public Long getId() { return id; }
    public InstructorProfile getInstructor() { return instructor; }
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
    public WorkshopStatus getStatus() { return status; }
    public Long getVersion() { return version; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setInstructor(InstructorProfile instructor) { this.instructor = instructor; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setDanceStyle(String danceStyle) { this.danceStyle = danceStyle; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public void setVenue(String venue) { this.venue = venue; }
    public void setCity(String city) { this.city = city; }
    public void setOnline(boolean online) { this.online = online; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public void setWorkshopDate(LocalDate workshopDate) { this.workshopDate = workshopDate; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
    public void setRegisteredSeats(Integer registeredSeats) { this.registeredSeats = registeredSeats; }
    public void setStatus(WorkshopStatus status) { this.status = status; }
}
