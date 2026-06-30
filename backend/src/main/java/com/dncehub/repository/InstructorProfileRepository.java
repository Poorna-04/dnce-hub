package com.dncehub.repository;

import com.dncehub.entity.InstructorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstructorProfileRepository extends JpaRepository<InstructorProfile, Long> {
}
