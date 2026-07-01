package com.dncehub.repository;

import com.dncehub.entity.WorkshopRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkshopRegistrationRepository extends JpaRepository<WorkshopRegistration, Long> {

    boolean existsByWorkshopIdAndStudentId(Long workshopId, Long studentId);

    Optional<WorkshopRegistration> findByWorkshopIdAndStudentId(Long workshopId, Long studentId);
}
