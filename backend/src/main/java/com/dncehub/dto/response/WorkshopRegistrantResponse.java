package com.dncehub.dto.response;

import java.time.LocalDateTime;

public class WorkshopRegistrantResponse {

    private Long studentProfileId;
    private String fullName;
    private String email;
    private String paymentStatus;
    private LocalDateTime registeredAt;

    public Long getStudentProfileId() { return studentProfileId; }
    public String getFullName()        { return fullName; }
    public String getEmail()           { return email; }
    public String getPaymentStatus()   { return paymentStatus; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long studentProfileId;
        private String fullName;
        private String email;
        private String paymentStatus;
        private LocalDateTime registeredAt;

        public Builder studentProfileId(Long v) { this.studentProfileId = v; return this; }
        public Builder fullName(String v)        { this.fullName = v; return this; }
        public Builder email(String v)           { this.email = v; return this; }
        public Builder paymentStatus(String v)   { this.paymentStatus = v; return this; }
        public Builder registeredAt(LocalDateTime v) { this.registeredAt = v; return this; }

        public WorkshopRegistrantResponse build() {
            WorkshopRegistrantResponse r = new WorkshopRegistrantResponse();
            r.studentProfileId = this.studentProfileId;
            r.fullName  = this.fullName;
            r.email     = this.email;
            r.paymentStatus = this.paymentStatus;
            r.registeredAt  = this.registeredAt;
            return r;
        }
    }
}
