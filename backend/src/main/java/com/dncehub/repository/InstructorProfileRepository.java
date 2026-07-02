package com.dncehub.repository;

import com.dncehub.entity.InstructorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InstructorProfileRepository extends JpaRepository<InstructorProfile, Long> {

    Optional<InstructorProfile> findByUserId(UUID userId);

    List<InstructorProfile> findByCityIgnoreCase(String city);

    List<InstructorProfile> findByDanceStylesContainingIgnoreCase(String style);
}
