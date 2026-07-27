package com.dncehub.repository;

import com.dncehub.entity.WorkshopRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkshopRegistrationRepository extends JpaRepository<WorkshopRegistration, Long> {

    boolean existsByWorkshopIdAndStudentId(Long workshopId, Long studentId);

    Optional<WorkshopRegistration> findByWorkshopIdAndStudentId(Long workshopId, Long studentId);

    // All registrations for a given student (by their user UUID)
    List<WorkshopRegistration> findByStudent_User_Id(UUID userId);

    // All registrations for a given workshop
    List<WorkshopRegistration> findByWorkshopId(Long workshopId);
}
