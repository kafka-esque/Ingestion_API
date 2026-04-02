package api_toolkit.repository;

import api_toolkit.entity.ProjectEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Project Repository - Database operations for projects
 * Provides CRUD operations and custom queries for project management
 */
@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {
    
    // Find project by unique identifier
    ProjectEntity findByProjectIdentifier(String projectIdentifier);
    
    // Find project by user and identifier (for uniqueness validation)
    ProjectEntity findByUserIdAndProjectIdentifier(Long userId, String projectIdentifier);

    // Find all projects for a specific user
    List<ProjectEntity> findByUserId(Long userId);
    
    // Find projects with valid user references (data integrity check)
    @Query("SELECT p FROM ProjectEntity p LEFT JOIN p.user u WHERE u.id IS NOT NULL OR p.user IS NULL")
    List<ProjectEntity> findAllWithValidUsers();
    
    // Find projects with invalid user references (for cleanup)
    @Query("SELECT p FROM ProjectEntity p WHERE p.user IS NOT NULL AND p.user.id IS NULL")
    List<ProjectEntity> findProjectsWithInvalidUsers();
}
