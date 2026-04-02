package api_toolkit.service;

import api_toolkit.dto.ProjectOperationDTO;
import api_toolkit.entity.OperationServiceEntity;
import api_toolkit.entity.ProjectEntity;
import api_toolkit.entity.ProjectOperationEntity;
import api_toolkit.exception.ResourceNotFoundException;
import api_toolkit.mapper.ProjectOperationMapper;
import api_toolkit.repository.OperationServiceRepository;
import api_toolkit.repository.ProjectOperationRepository;
import api_toolkit.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectOperationService {

    @Autowired
    private ProjectOperationRepository projectOperationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private OperationServiceRepository operationServiceRepository;

    @Autowired
    private ProjectOperationMapper projectOperationMapper;

    // ✅ Get all mappings
    public List<ProjectOperationDTO> getAllMappings() {
        return projectOperationRepository.findAll()
                .stream()
                .map(projectOperationMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ✅ Add a new mapping
    public ProjectOperationDTO addMapping(ProjectOperationDTO dto) {
        ProjectEntity project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + dto.getProjectId()));

        OperationServiceEntity service = operationServiceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Operation Service not found with ID: " + dto.getServiceId()));

        ProjectOperationEntity entity = projectOperationMapper.toEntity(dto, project, service);
        ProjectOperationEntity saved = projectOperationRepository.save(entity);

        return projectOperationMapper.toDTO(saved);
    }

    // ✅ Delete a mapping
    public void deleteMapping(Long id) {
        if (!projectOperationRepository.existsById(id)) {
            throw new ResourceNotFoundException("ProjectOperation mapping not found with ID: " + id);
        }
        projectOperationRepository.deleteById(id);
    }

    // ✅ Get mappings by project ID
    public List<ProjectOperationDTO> getMappingsByProjectId(Long projectId) {
        return projectOperationRepository.findByProjectId(projectId)
                .stream()
                .map(projectOperationMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ✅ Add multiple operations to a project
    public List<ProjectOperationDTO> addOperationsToProject(Long projectId, List<Long> operationServiceIds) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        return operationServiceIds.stream()
                .map(serviceId -> {
                    OperationServiceEntity service = operationServiceRepository.findById(serviceId)
                            .orElseThrow(() -> new ResourceNotFoundException("Operation Service not found with ID: " + serviceId));
                    
                    ProjectOperationDTO dto = new ProjectOperationDTO();
                    dto.setProjectId(projectId);
                    dto.setServiceId(serviceId);
                    
                    ProjectOperationEntity entity = projectOperationMapper.toEntity(dto, project, service);
                    ProjectOperationEntity saved = projectOperationRepository.save(entity);
                    
                    return projectOperationMapper.toDTO(saved);
                })
                .collect(Collectors.toList());
    }
}
