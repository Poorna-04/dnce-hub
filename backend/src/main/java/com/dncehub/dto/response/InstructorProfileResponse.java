package com.dncehub.dto.response;

import com.dncehub.entity.enums.TeachingMode;

import java.math.BigDecimal;
import java.util.List;

public class InstructorProfileResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private Integer experienceYears;
    private List<String> danceStyles;
    private BigDecimal hourlyRate;
    private String city;
    private TeachingMode teachingMode;

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public Integer getExperienceYears() { return experienceYears; }
    public List<String> getDanceStyles() { return danceStyles; }
    public BigDecimal getHourlyRate() { return hourlyRate; }
    public String getCity() { return city; }
    public TeachingMode getTeachingMode() { return teachingMode; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long userId;
        private String fullName;
        private String email;
        private Integer experienceYears;
        private List<String> danceStyles;
        private BigDecimal hourlyRate;
        private String city;
        private TeachingMode teachingMode;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder experienceYears(Integer e) { this.experienceYears = e; return this; }
        public Builder danceStyles(List<String> d) { this.danceStyles = d; return this; }
        public Builder hourlyRate(BigDecimal r) { this.hourlyRate = r; return this; }
        public Builder city(String city) { this.city = city; return this; }
        public Builder teachingMode(TeachingMode t) { this.teachingMode = t; return this; }

        public InstructorProfileResponse build() {
            InstructorProfileResponse r = new InstructorProfileResponse();
            r.id = this.id;
            r.userId = this.userId;
            r.fullName = this.fullName;
            r.email = this.email;
            r.experienceYears = this.experienceYears;
            r.danceStyles = this.danceStyles;
            r.hourlyRate = this.hourlyRate;
            r.city = this.city;
            r.teachingMode = this.teachingMode;
            return r;
        }
    }
}
