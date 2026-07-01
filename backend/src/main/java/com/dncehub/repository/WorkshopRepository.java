package com.dncehub.repository;

import com.dncehub.entity.Workshop;
import com.dncehub.entity.enums.WorkshopStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkshopRepository extends JpaRepository<Workshop, Long> {

    // Public listing — only UPCOMING workshops, optional city/style filter
    @Query("""
            SELECT w FROM Workshop w
            WHERE w.status = 'UPCOMING'
              AND (:city IS NULL OR LOWER(w.city) = LOWER(:city))
              AND (:style IS NULL OR LOWER(w.danceStyle) LIKE LOWER(CONCAT('%', :style, '%')))
            ORDER BY w.workshopDate ASC
            """)
    List<Workshop> findUpcoming(
            @Param("city") String city,
            @Param("style") String style
    );

    // Instructor's own workshops
    List<Workshop> findByInstructorIdOrderByWorkshopDateDesc(Long instructorId);
}
