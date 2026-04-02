package api_toolkit.repository;

import api_toolkit.entity.ProjectContactEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Project Contact Repository - Database operations for project-contact mappings
 * Provides CRUD operations for linking projects with contacts
 */
@Repository
public interface ProjectContactRepository extends JpaRepository<ProjectContactEntity, Long> {
    
    // Find all contacts for a specific project
    List<ProjectContactEntity> findByProjectId(Long projectId);
}
