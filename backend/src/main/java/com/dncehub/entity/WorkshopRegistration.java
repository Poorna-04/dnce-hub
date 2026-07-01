package com.dncehub.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workshop_registrations")
public class WorkshopRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    // PENDING, PAID, REFUNDED
    private String paymentStatus = "PENDING";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime registeredAt;

    public WorkshopRegistration() {}

    public Long getId() { return id; }
    public Workshop getWorkshop() { return workshop; }
    public StudentProfile getStudent() { return student; }
    public String getPaymentStatus() { return paymentStatus; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }

    public void setWorkshop(Workshop workshop) { this.workshop = workshop; }
    public void setStudent(StudentProfile student) { this.student = student; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}
