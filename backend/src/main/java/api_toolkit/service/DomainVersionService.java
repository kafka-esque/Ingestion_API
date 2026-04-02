package api_toolkit.service;

import api_toolkit.dto.DomainVersionDTO;
import api_toolkit.entity.DomainEntity;
import api_toolkit.entity.DomainVersionEntity;
import api_toolkit.exception.ResourceNotFoundException;
import api_toolkit.mapper.DomainVersionMapper;
import api_toolkit.repository.DomainRepository;
import api_toolkit.repository.DomainVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Domain version service for managing API domain versions with CRUD operations.
 * Beginner-friendly: Shows service layer with relationships and validation patterns.
 */
@Service
@RequiredArgsConstructor
public class DomainVersionService {
    
    private final DomainVersionRepository repo;
    private final DomainRepository domainRepo;
    private final DomainVersionMapper mapper;
    private final AuthorizationService authorizationService;

    /** Get all domain versions (public access) */
    public List<DomainVersionDTO> getAll() {
        return repo.findAll().stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    /** Get domain version by ID */
    public DomainVersionDTO getById(Long id) {
        return repo.findById(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Domain version not found: " + id));
    }

    /** Create new domain version (admin/onboarding only) */
    public DomainVersionDTO create(DomainVersionDTO dto) {
        authorizationService.requireAdminOrOnboardingPermissions();
        DomainEntity domain = findDomainById(dto.getDomainId());
        DomainVersionEntity entity = mapper.toEntity(dto, domain);
        return mapper.toDTO(repo.save(entity));
    }

    /** Update existing domain version (admin/onboarding only) */
    public DomainVersionDTO update(Long id, DomainVersionDTO dto) {
        authorizationService.requireAdminOrOnboardingPermissions();
        DomainVersionEntity entity = findVersionById(id);
        entity.setVersion(dto.getVersion());
        return mapper.toDTO(repo.save(entity));
    }

    /** Delete domain version (admin/onboarding only) */
    public void delete(Long id) {
        authorizationService.requireAdminOrOnboardingPermissions();
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Domain version not found: " + id);
        }
        repo.deleteById(id);
    }

    /** Get all versions for specific domain */
    public List<DomainVersionDTO> getVersionsByDomainId(Long domainId) {
        try {
            return repo.findByDomainId(domainId).stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching domain versions for domainId: " + domainId, e);
        }
    }

    /** Check if domain exists */
    public boolean checkDomainExists(Long domainId) {
        return domainRepo.existsById(domainId);
    }

    /** Count versions for specific domain */
    public long countVersionsByDomainId(Long domainId) {
        return repo.countByDomainId(domainId);
    }

    // Helper methods

    /** Find domain by ID or throw exception */
    private DomainEntity findDomainById(Long domainId) {
        return domainRepo.findById(domainId)
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found: " + domainId));
    }

    /** Find domain version by ID or throw exception */
    private DomainVersionEntity findVersionById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Domain version not found: " + id));
    }
}
