package com.dncehub.dto.request;

import com.dncehub.entity.enums.TeachingMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class InstructorProfileRequest {

    // Temporary until auth is added — will be replaced by JWT principal
    @NotNull(message = "User ID is required")
    private Long userId;

    @Min(value = 0, message = "Experience years must be 0 or more")
    private Integer experienceYears;

    private String danceStyles;

    @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be greater than 0")
    private BigDecimal hourlyRate;

    private String city;

    private TeachingMode teachingMode;

    public Long getUserId() { return userId; }
    public Integer getExperienceYears() { return experienceYears; }
    public String getDanceStyles() { return danceStyles; }
    public BigDecimal getHourlyRate() { return hourlyRate; }
    public String getCity() { return city; }
    public TeachingMode getTeachingMode() { return teachingMode; }

    public void setUserId(Long userId) { this.userId = userId; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public void setDanceStyles(String danceStyles) { this.danceStyles = danceStyles; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
    public void setCity(String city) { this.city = city; }
    public void setTeachingMode(TeachingMode teachingMode) { this.teachingMode = teachingMode; }
}
