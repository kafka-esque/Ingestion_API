package api_toolkit.mapper;

import api_toolkit.dto.DomainVersionDTO;
import api_toolkit.entity.*;
import org.springframework.stereotype.Component;

/**
 * Domain Version Mapper - Converts between Domain Version DTOs and Entities
 * Handles data transformation for domain version operations
 */
@Component
public class DomainVersionMapper {

    // Convert entity to DTO for API responses
    public DomainVersionDTO toDTO(DomainVersionEntity entity) {
        if (entity == null) return null;

        DomainVersionDTO dto = new DomainVersionDTO();
        dto.setId(entity.getId());
        dto.setVersion(entity.getVersion());
        
        // Extract domain ID safely
        if (entity.getDomain() != null) {
            dto.setDomainId(entity.getDomain().getId());
        } else {
            throw new RuntimeException("Domain is null for DomainVersionEntity with ID: " + entity.getId());
        }
        return dto;
    }

    // Convert DTO to entity for database operations
    public DomainVersionEntity toEntity(DomainVersionDTO dto, DomainEntity domain) {
        if (dto == null) return null;

        DomainVersionEntity entity = new DomainVersionEntity();
        entity.setVersion(dto.getVersion());
        entity.setDomain(domain);
        return entity;
    }
}
