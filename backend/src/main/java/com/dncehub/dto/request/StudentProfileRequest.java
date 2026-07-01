package com.dncehub.dto.request;

import jakarta.validation.constraints.NotNull;

public class StudentProfileRequest {

    // Temporary until auth is added — will be replaced by JWT principal
    @NotNull(message = "User ID is required")
    private Long userId;

    private String danceInterests;

    private String bio;

    public Long getUserId() { return userId; }
    public String getDanceInterests() { return danceInterests; }
    public String getBio() { return bio; }

    public void setUserId(Long userId) { this.userId = userId; }
    public void setDanceInterests(String danceInterests) { this.danceInterests = danceInterests; }
    public void setBio(String bio) { this.bio = bio; }
}
