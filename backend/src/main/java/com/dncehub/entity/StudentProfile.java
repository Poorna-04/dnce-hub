package com.dncehub.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    // Comma-separated, e.g. "Salsa,Contemporary"
    private String danceInterests;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @ManyToMany
    @JoinTable(
            name = "saved_instructors",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "instructor_id")
    )
    private List<InstructorProfile> savedInstructors = new ArrayList<>();

    public StudentProfile() {}

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getDanceInterests() { return danceInterests; }
    public String getBio() { return bio; }
    public List<InstructorProfile> getSavedInstructors() { return savedInstructors; }

    public void setUser(User user) { this.user = user; }
    public void setDanceInterests(String danceInterests) { this.danceInterests = danceInterests; }
    public void setBio(String bio) { this.bio = bio; }
    public void setSavedInstructors(List<InstructorProfile> savedInstructors) { this.savedInstructors = savedInstructors; }
}
