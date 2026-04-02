package api_toolkit.mapper;

import api_toolkit.dto.ProjectContactDTO;
import api_toolkit.entity.ContactEntity;
import api_toolkit.entity.ProjectContactEntity;
import api_toolkit.entity.ProjectEntity;
import org.springframework.stereotype.Component;

@Component
public class ProjectContactMapper {

    public ProjectContactDTO toDTO(ProjectContactEntity entity) {
        if (entity == null) return null;

        ProjectContactDTO dto = new ProjectContactDTO();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProject().getId());
        dto.setContactId(entity.getContact().getId());
        return dto;
    }

    public ProjectContactEntity toEntity(ProjectContactDTO dto, ProjectEntity project, ContactEntity contact) {
        if (dto == null) return null;

        ProjectContactEntity entity = new ProjectContactEntity();
        // entity.setId(dto.getId());
        entity.setProject(project);
        entity.setContact(contact);
        return entity;
    }
}
