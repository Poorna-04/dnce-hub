package com.dncehub.dto.request;

public class StudentProfileRequest {

    private String danceInterests;
    private String bio;

    public String getDanceInterests() { return danceInterests; }
    public String getBio() { return bio; }

    public void setDanceInterests(String danceInterests) { this.danceInterests = danceInterests; }
    public void setBio(String bio) { this.bio = bio; }
}
