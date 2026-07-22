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

    // All upcoming, no filter
    @Query("SELECT w FROM Workshop w WHERE w.status = 'UPCOMING' ORDER BY w.workshopDate ASC")
    List<Workshop> fetchUpcoming();

    // Filter by city (case-insensitive)
    @Query("""
            SELECT w FROM Workshop w
            WHERE w.status = 'UPCOMING'
              AND LOWER(w.city) = LOWER(:city)
            ORDER BY w.workshopDate ASC
            """)
    List<Workshop> fetchUpcomingByCity(@Param("city") String city);

    // Filter by dance style (case-insensitive, partial match)
    @Query("""
            SELECT w FROM Workshop w
            WHERE w.status = 'UPCOMING'
              AND LOWER(w.danceStyle) LIKE LOWER(CONCAT('%', :style, '%'))
            ORDER BY w.workshopDate ASC
            """)
    List<Workshop> fetchUpcomingByStyle(@Param("style") String style);

    // Instructor's own workshops
    List<Workshop> findByInstructorIdOrderByWorkshopDateDesc(Long instructorId);
}
