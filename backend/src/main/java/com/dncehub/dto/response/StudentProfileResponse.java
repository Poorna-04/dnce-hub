package com.dncehub.dto.response;

import java.util.List;

public class StudentProfileResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private List<String> danceInterests;
    private String bio;

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public List<String> getDanceInterests() { return danceInterests; }
    public String getBio() { return bio; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long userId;
        private String fullName;
        private String email;
        private List<String> danceInterests;
        private String bio;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder danceInterests(List<String> d) { this.danceInterests = d; return this; }
        public Builder bio(String bio) { this.bio = bio; return this; }

        public StudentProfileResponse build() {
            StudentProfileResponse r = new StudentProfileResponse();
            r.id = this.id;
            r.userId = this.userId;
            r.fullName = this.fullName;
            r.email = this.email;
            r.danceInterests = this.danceInterests;
            r.bio = this.bio;
            return r;
        }
    }
}
