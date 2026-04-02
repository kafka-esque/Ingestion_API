package api_toolkit.repository;

import api_toolkit.entity.ProjectOperationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Project Operation Repository - Database operations for project-operation mappings
 * Provides CRUD operations for linking projects with operation services
 */
@Repository
public interface ProjectOperationRepository extends JpaRepository<ProjectOperationEntity, Long> {
    
    // Find all operations for a specific project
    List<ProjectOperationEntity> findByProjectId(Long projectId);
}
