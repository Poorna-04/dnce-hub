package com.dncehub.entity;

import com.dncehub.entity.enums.BookingStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private InstructorProfile instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private AvailabilitySlot slot;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalAmount;

    // "STUDENT" or "INSTRUCTOR" — populated only on cancellation
    private String cancelledBy;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Booking() {}

    public Long getId() { return id; }
    public StudentProfile getStudent() { return student; }
    public InstructorProfile getInstructor() { return instructor; }
    public AvailabilitySlot getSlot() { return slot; }
    public LocalDate getBookingDate() { return bookingDate; }
    public BookingStatus getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getCancelledBy() { return cancelledBy; }
    public Long getVersion() { return version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setStudent(StudentProfile student) { this.student = student; }
    public void setInstructor(InstructorProfile instructor) { this.instructor = instructor; }
    public void setSlot(AvailabilitySlot slot) { this.slot = slot; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }
}
