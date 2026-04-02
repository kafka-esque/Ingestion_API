package api_toolkit.mapper;

import api_toolkit.dto.OperationServiceDTO;
import api_toolkit.entity.*;
import org.springframework.stereotype.Component;

/**
 * Operation Service Mapper - Converts between Operation Service DTOs and Entities
 * Handles data transformation for operation service operations
 */
@Component
public class OperationServiceMapper {

    // Convert entity to DTO for API responses
    public OperationServiceDTO toDTO(OperationServiceEntity entity) {
        if (entity == null) return null;

        OperationServiceDTO dto = new OperationServiceDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getOperationName());
        
        // Extract domain and version IDs safely
        if (entity.getDomain() != null) {
            dto.setDomainId(entity.getDomain().getId());
        }
        if (entity.getVersion() != null) {
            dto.setVersionId(entity.getVersion().getId());
        }
        return dto;
    }

    // Convert DTO to entity for database operations
    public OperationServiceEntity toEntity(OperationServiceDTO dto, DomainEntity domain, DomainVersionEntity version) {
        if (dto == null) return null;

        OperationServiceEntity entity = new OperationServiceEntity();
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setOperationName(dto.getName());
        entity.setDomain(domain);
        entity.setVersion(version);
        return entity;
    }

    // Update existing entity with new data
    public void updateEntity(OperationServiceEntity entity, OperationServiceDTO dto, 
                           DomainEntity domain, DomainVersionEntity version) {
        if (entity == null || dto == null) return;
        
        entity.setOperationName(dto.getName());
        entity.setDomain(domain);
        entity.setVersion(version);
    }
}
