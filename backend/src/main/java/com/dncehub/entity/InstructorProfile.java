package com.dncehub.entity;

import com.dncehub.entity.enums.TeachingMode;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "instructor_profiles")
public class InstructorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private Integer experienceYears;

    // Comma-separated, e.g. "Salsa,Bachata,Hip-Hop"
    private String danceStyles;

    @Column(precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    private String city;

    @Enumerated(EnumType.STRING)
    private TeachingMode teachingMode;

    public InstructorProfile() {}

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Integer getExperienceYears() { return experienceYears; }
    public String getDanceStyles() { return danceStyles; }
    public BigDecimal getHourlyRate() { return hourlyRate; }
    public String getCity() { return city; }
    public TeachingMode getTeachingMode() { return teachingMode; }

    public void setUser(User user) { this.user = user; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public void setDanceStyles(String danceStyles) { this.danceStyles = danceStyles; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
    public void setCity(String city) { this.city = city; }
    public void setTeachingMode(TeachingMode teachingMode) { this.teachingMode = teachingMode; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User user;
        private Integer experienceYears;
        private String danceStyles;
        private BigDecimal hourlyRate;
        private String city;
        private TeachingMode teachingMode;

        public Builder user(User user) { this.user = user; return this; }
        public Builder experienceYears(Integer e) { this.experienceYears = e; return this; }
        public Builder danceStyles(String s) { this.danceStyles = s; return this; }
        public Builder hourlyRate(BigDecimal r) { this.hourlyRate = r; return this; }
        public Builder city(String city) { this.city = city; return this; }
        public Builder teachingMode(TeachingMode t) { this.teachingMode = t; return this; }

        public InstructorProfile build() {
            InstructorProfile p = new InstructorProfile();
            p.user = this.user;
            p.experienceYears = this.experienceYears;
            p.danceStyles = this.danceStyles;
            p.hourlyRate = this.hourlyRate;
            p.city = this.city;
            p.teachingMode = this.teachingMode;
            return p;
        }
    }
}
