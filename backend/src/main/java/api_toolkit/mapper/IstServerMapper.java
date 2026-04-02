package api_toolkit.mapper;

import api_toolkit.dto.IstServerDTO;
import api_toolkit.entity.IstServerEntity;
import org.springframework.stereotype.Component;

/**
 * IST Server Mapper - Converts between IST Server DTOs and Entities
 * Handles data transformation for server operations
 */
@Component
public class IstServerMapper {

    // Convert entity to DTO for API responses
    public IstServerDTO toDTO(IstServerEntity entity) {
        if (entity == null) return null;

        IstServerDTO dto = new IstServerDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        return dto;
    }

    // Convert DTO to entity for database operations
    public IstServerEntity toEntity(IstServerDTO dto) {
        if (dto == null) return null;

        IstServerEntity entity = new IstServerEntity();
        entity.setName(dto.getName());
        return entity;
    }
}
