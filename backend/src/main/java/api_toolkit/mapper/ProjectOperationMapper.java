package api_toolkit.mapper;

import api_toolkit.dto.ProjectOperationDTO;
import api_toolkit.entity.*;
import org.springframework.stereotype.Component;

/**
 * Project Operation Mapper - Converts between Project Operation DTOs and Entities
 * Handles data transformation for project-operation mapping operations
 */
@Component
public class ProjectOperationMapper {

    // Convert entity to DTO for API responses
    public ProjectOperationDTO toDTO(ProjectOperationEntity entity) {
        if (entity == null) return null;

        ProjectOperationDTO dto = new ProjectOperationDTO();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProject().getId());
        dto.setServiceId(entity.getService().getId());
        return dto;
    }

    // Convert DTO to entity for database operations
    public ProjectOperationEntity toEntity(ProjectOperationDTO dto, ProjectEntity project, OperationServiceEntity service) {
        if (dto == null) return null;

        ProjectOperationEntity entity = new ProjectOperationEntity();
        entity.setProject(project);
        entity.setService(service);
        return entity;
    }
}
