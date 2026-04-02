package api_toolkit.mapper;

import api_toolkit.dto.ContactDTO;
import api_toolkit.entity.ContactEntity;
import org.springframework.stereotype.Component;

/**
 * Contact Mapper - Converts between Contact DTOs and Entities
 * Handles data transformation for contact operations
 */
@Component
public class ContactMapper {

    // Convert entity to DTO for API responses
    public ContactDTO toDTO(ContactEntity entity) {
        if (entity == null) return null;

        ContactDTO dto = new ContactDTO();
        dto.setId(entity.getId());
        dto.setEmailName(entity.getEmailName());
        dto.setEmailId(entity.getEmailId());
        dto.setContactType(entity.getContactType());
        return dto;
    }

    // Convert DTO to entity for database operations
    public ContactEntity toEntity(ContactDTO dto) {
        if (dto == null) return null;

        ContactEntity entity = new ContactEntity();
        entity.setEmailName(dto.getEmailName());
        entity.setEmailId(dto.getEmailId());
        entity.setContactType(dto.getContactType());
        return entity;
    }
}
