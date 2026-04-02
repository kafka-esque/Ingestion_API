package api_toolkit.service;

import api_toolkit.dto.OperationServiceDTO;
import api_toolkit.entity.*;
import api_toolkit.exception.*;
import api_toolkit.mapper.OperationServiceMapper;
import api_toolkit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Operation service management for API operations with CRUD and validation.
 * Beginner-friendly: Shows complex service patterns with entity relationships and validation.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OperationServiceService {
    
    private final OperationServiceRepository operationServiceRepository;
    private final DomainRepository domainRepository;
    private final DomainVersionRepository domainVersionRepository;
    private final OperationServiceMapper operationServiceMapper;
    private final AuthorizationService authorizationService;

    /** Get all operation services */
    @Transactional(readOnly = true)
    public List<OperationServiceDTO> getAllOperationServices() {
        log.debug("Fetching all operation services");
        return mapToDTO(operationServiceRepository.findAll());
    }

    /** Get operation service by ID */
    @Transactional(readOnly = true)
    public OperationServiceDTO getOperationServiceById(Long id) {
        log.debug("Fetching operation service with ID: {}", id);
        return operationServiceMapper.toDTO(findOperationServiceById(id));
    }

    /** Create new operation service (admin/onboarding only) */
    public OperationServiceDTO createOperationService(OperationServiceDTO dto) {
        log.debug("Creating operation service: {}", dto.getName());
        authorizationService.requireAdminOrOnboardingPermissions();
        
        validateOperationServiceInput(dto);
        DomainEntity domain = findDomainById(dto.getDomainId());
        DomainVersionEntity version = findVersionById(dto.getVersionId());
        
        validateUniqueOperationName(dto.getName(), dto.getDomainId(), null);
        
        OperationServiceEntity entity = operationServiceMapper.toEntity(dto, domain, version);
        OperationServiceEntity saved = operationServiceRepository.save(entity);
        
        log.info("Created operation service: {} (ID: {})", saved.getOperationName(), saved.getId());
        return operationServiceMapper.toDTO(saved);
    }

    /** Update existing operation service (admin/onboarding only) */
    public OperationServiceDTO updateOperationService(Long id, OperationServiceDTO dto) {
        log.debug("Updating operation service with ID: {}", id);
        authorizationService.requireAdminOrOnboardingPermissions();
        
        validateOperationServiceInput(dto);
        OperationServiceEntity entity = findOperationServiceById(id);
        DomainEntity domain = findDomainById(dto.getDomainId());
        DomainVersionEntity version = findVersionById(dto.getVersionId());
        
        validateUniqueOperationName(dto.getName(), dto.getDomainId(), id);
        
        updateEntityFields(entity, dto, domain, version);
        OperationServiceEntity updated = operationServiceRepository.save(entity);
        
        log.info("Updated operation service: {} (ID: {})", updated.getOperationName(), updated.getId());
        return operationServiceMapper.toDTO(updated);
    }

    /** Delete operation service (admin/onboarding only) */
    public void deleteOperationService(Long id) {
        log.debug("Deleting operation service with ID: {}", id);
        authorizationService.requireAdminOrOnboardingPermissions();
        
        if (!operationServiceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Operation service not found with ID: " + id);
        }
        
        operationServiceRepository.deleteById(id);
        log.info("Deleted operation service with ID: {}", id);
    }

    /** Get operation services by domain ID */
    @Transactional(readOnly = true)
    public List<OperationServiceDTO> getOperationServicesByDomainId(Long domainId) {
        log.debug("Fetching operation services for domain ID: {}", domainId);
        findDomainById(domainId); // Validate domain exists
        return mapToDTO(operationServiceRepository.findByDomainId(domainId));
    }

    /** Get operation services by version ID */
    @Transactional(readOnly = true)
    public List<OperationServiceDTO> getOperationServicesByVersionId(Long versionId) {
        log.debug("Fetching operation services for version ID: {}", versionId);
        findVersionById(versionId); // Validate version exists
        return mapToDTO(operationServiceRepository.findByVersionId(versionId));
    }

    /** Get operation services by domain and version */
    @Transactional(readOnly = true)
    public List<OperationServiceDTO> getOperationServicesByDomainAndVersion(Long domainId, Long versionId) {
        log.debug("Fetching operation services for domain: {} and version: {}", domainId, versionId);
        findDomainById(domainId);   // Validate domain exists
        findVersionById(versionId); // Validate version exists
        return mapToDTO(operationServiceRepository.findByDomainIdAndVersionId(domainId, versionId));
    }

    /** Check if operation service exists by name and domain */
    @Transactional(readOnly = true)
    public boolean existsByNameAndDomain(String operationName, Long domainId) {
        return operationServiceRepository.existsByOperationNameAndDomainId(operationName, domainId);
    }

    // Helper methods - streamlined validation and lookup

    /** Find operation service by ID or throw exception */
    private OperationServiceEntity findOperationServiceById(Long id) {
        return operationServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operation service not found with ID: " + id));
    }

    /** Find domain by ID or throw exception */
    private DomainEntity findDomainById(Long domainId) {
        return domainRepository.findById(domainId)
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found with ID: " + domainId));
    }

    /** Find version by ID or throw exception */
    private DomainVersionEntity findVersionById(Long versionId) {
        return domainVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Domain version not found with ID: " + versionId));
    }

    /** Validate operation service input data */
    private void validateOperationServiceInput(OperationServiceDTO dto) {
        if (dto == null) throw new IllegalArgumentException("Operation service data cannot be null");
        if (!StringUtils.hasText(dto.getName())) throw new IllegalArgumentException("Operation service name cannot be empty");
        
        String name = dto.getName().trim();
        if (name.length() < 2) throw new IllegalArgumentException("Operation service name must be at least 2 characters long");
        if (name.length() > 255) throw new IllegalArgumentException("Operation service name cannot exceed 255 characters");
        if (dto.getDomainId() == null || dto.getDomainId() <= 0) throw new IllegalArgumentException("Valid domain ID is required");
        if (dto.getVersionId() == null || dto.getVersionId() <= 0) throw new IllegalArgumentException("Valid version ID is required");
    }

    /** Validate unique operation name for domain */
    private void validateUniqueOperationName(String name, Long domainId, Long excludeId) {
        boolean exists = excludeId != null ? 
                operationServiceRepository.existsByOperationNameAndDomainIdAndIdNot(name, domainId, excludeId) :
                operationServiceRepository.existsByOperationNameAndDomainId(name, domainId);
        
        if (exists) {
            throw new ResourceConflictException("Operation service with name '" + name + 
                    "' already exists for domain ID: " + domainId);
        }
    }

    /** Update entity fields from DTO */
    private void updateEntityFields(OperationServiceEntity entity, OperationServiceDTO dto, 
                                    DomainEntity domain, DomainVersionEntity version) {
        entity.setDomain(domain);
        entity.setVersion(version);
        entity.setOperationName(dto.getName());
    }

    /** Convert entity list to DTO list */
    private List<OperationServiceDTO> mapToDTO(List<OperationServiceEntity> entities) {
        return entities.stream().map(operationServiceMapper::toDTO).collect(Collectors.toList());
    }
}
