package api_toolkit.mapper;

import api_toolkit.dto.ProjectDTO;
import api_toolkit.entity.ProjectEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between ProjectEntity and ProjectDTO
 */
@Component
public class ProjectMapper {

    /**
     * Convert ProjectEntity to ProjectDTO
     * @param entity The entity to convert
     * @return The converted DTO or null if entity is null
     */
    public ProjectDTO toDTO(ProjectEntity entity) {
        if (entity == null) {
            return null;
        }

        ProjectDTO dto = new ProjectDTO();
        dto.setId(entity.getId());
        dto.setProjectIdentifier(entity.getProjectIdentifier());
        dto.setProjectName(entity.getProjectName());
        dto.setApplicationName(entity.getApplicationName());
        dto.setPartnerPrismId(entity.getPartnerPrismId());
        dto.setTargetPlatform(entity.getTargetPlatform());
        dto.setTargetPlatformOther(entity.getTargetPlatformOther());
        dto.setClientType(entity.getClientType());
        dto.setCsiClientLoginName(entity.getCsiClientLoginName());
        dto.setDirectInternetAccess(entity.getDirectInternetAccess());
        dto.setProjectDescription(entity.getProjectDescription());
        
        // Handle User relationship safely - check for both null and invalid IDs
        if (entity.getUser() != null && entity.getUser().getId() != null && entity.getUser().getId() > 0) {
            dto.setUserId(entity.getUser().getId());
        } else {
            // Log warning for data integrity issues
            if (entity.getUser() != null && (entity.getUser().getId() == null || entity.getUser().getId() <= 0)) {
                System.err.println("Warning: Project ID " + entity.getId() + " has invalid user ID: " + entity.getUser().getId());
            }
            dto.setUserId(null); // Set to null for invalid user references
        }
        
        // Handle IST Server relationship safely - check for both null and invalid IDs
        if (entity.getIstServer() != null && entity.getIstServer().getId() != null && entity.getIstServer().getId() > 0) {
            dto.setIstServerId(entity.getIstServer().getId());
        } else {
            // Log warning for data integrity issues
            if (entity.getIstServer() != null && (entity.getIstServer().getId() == null || entity.getIstServer().getId() <= 0)) {
                System.err.println("Warning: Project ID " + entity.getId() + " has invalid IST server ID: " + entity.getIstServer().getId());
            }
            dto.setIstServerId(null); // Set to null for invalid IST server references
        }
        
        // Map audit fields
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setLastModifiedByUserId(entity.getLastModifiedByUserId());
        dto.setLastModifiedByUsername(entity.getLastModifiedByUsername());
        dto.setLastModifiedByRole(entity.getLastModifiedByRole());
        
        return dto;
    }

    /**
     * Convert ProjectDTO to ProjectEntity (basic fields only)
     * Note: User and IstServer relationships should be set separately in the service
     * @param dto The DTO to convert
     * @return The converted entity or null if dto is null
     */
    public ProjectEntity toEntity(ProjectDTO dto) {
        if (dto == null) {
            return null;
        }

        ProjectEntity entity = new ProjectEntity();
        
        // Don't set ID for new entities (it will be generated)
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        entity.setProjectIdentifier(dto.getProjectIdentifier());
        entity.setProjectName(dto.getProjectName());
        entity.setApplicationName(dto.getApplicationName());
        entity.setPartnerPrismId(dto.getPartnerPrismId());
        entity.setTargetPlatform(dto.getTargetPlatform());
        entity.setTargetPlatformOther(dto.getTargetPlatformOther());
        entity.setClientType(dto.getClientType());
        entity.setCsiClientLoginName(dto.getCsiClientLoginName());
        entity.setDirectInternetAccess(dto.getDirectInternetAccess());
        entity.setProjectDescription(dto.getProjectDescription());
        
        // Note: User and IstServer relationships are set in the service layer
        // after validation to avoid issues with invalid IDs
        
        return entity;
    }

    /**
     * Update an existing entity with data from DTO
     * @param entity The entity to update
     * @param dto The DTO with new data
     */
    public void updateEntity(ProjectEntity entity, ProjectDTO dto) {
        if (entity == null || dto == null) {
            return;
        }
        
        entity.setProjectIdentifier(dto.getProjectIdentifier());
        entity.setProjectName(dto.getProjectName());
        entity.setApplicationName(dto.getApplicationName());
        entity.setPartnerPrismId(dto.getPartnerPrismId());
        entity.setTargetPlatform(dto.getTargetPlatform());
        entity.setTargetPlatformOther(dto.getTargetPlatformOther());
        entity.setClientType(dto.getClientType());
        entity.setCsiClientLoginName(dto.getCsiClientLoginName());
        entity.setDirectInternetAccess(dto.getDirectInternetAccess());
        entity.setProjectDescription(dto.getProjectDescription());
        
        // Note: User and IstServer relationships should be updated separately in the service
    }
}
