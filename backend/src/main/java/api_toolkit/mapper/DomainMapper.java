package api_toolkit.mapper;

import api_toolkit.dto.DomainDTO;
import api_toolkit.entity.DomainEntity;
import org.springframework.stereotype.Component;

/**
 * Domain Mapper - Converts between Domain DTOs and Entities
 * Handles data transformation for domain operations
 */
@Component
public class DomainMapper {

    // Convert entity to DTO for API responses
    public DomainDTO toDTO(DomainEntity entity) {
        if (entity == null) return null;

        DomainDTO dto = new DomainDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        return dto;
    }

    // Convert DTO to entity for database operations
    public DomainEntity toEntity(DomainDTO dto) {
        if (dto == null) return null;

        DomainEntity entity = new DomainEntity();
        entity.setName(dto.getName());
        return entity;
    }
}
