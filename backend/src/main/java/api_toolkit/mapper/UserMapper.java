package api_toolkit.mapper;

import api_toolkit.dto.UserDTO;
import api_toolkit.entity.UserEntity;
import org.springframework.stereotype.Component;

/**
 * User Mapper - Converts between User DTOs and Entities
 * Handles data transformation for user operations
 */
@Component
public class UserMapper {
    
    // Convert entity to DTO for API responses
    public UserDTO toDTO(UserEntity entity) {
        if (entity == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setPassword(entity.getPassword());
        dto.setRole(entity.getRole());
        return dto;
    }

    // Convert DTO to entity for database operations
    public UserEntity toEntity(UserDTO dto) {
        if (dto == null) return null;

        UserEntity entity = new UserEntity();
        entity.setName(dto.getName());
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        entity.setRole(dto.getRole());
        return entity;
    }
}
