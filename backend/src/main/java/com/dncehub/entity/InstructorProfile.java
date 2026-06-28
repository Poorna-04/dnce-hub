package com.dncehub.entity;

import com.dncehub.entity.enums.TeachingMode;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "instructor_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
