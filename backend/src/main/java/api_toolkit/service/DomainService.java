package api_toolkit.service;

import api_toolkit.dto.DomainDTO;
import api_toolkit.entity.DomainEntity;
import api_toolkit.exception.ResourceNotFoundException;
import api_toolkit.mapper.DomainMapper;
import api_toolkit.repository.DomainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Domain service for API domain management with CRUD operations.
 * Beginner-friendly: Shows service layer patterns with authorization and validation.
 */
@Service
@RequiredArgsConstructor
public class DomainService {
    
    private final DomainRepository repo;
    private final DomainMapper mapper;
    private final AuthorizationService authorizationService;

    /** Get all domains (public access) */
    public List<DomainDTO> getAll() {
        return repo.findAll().stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    /** Get domain by ID */
    public DomainDTO getById(Long id) {
        return mapper.toDTO(findDomainById(id));
    }

    /** Create new domain (admin/onboarding only) */
    public DomainDTO create(DomainDTO dto) {
        authorizationService.requireAdminOrOnboardingPermissions();
        return mapper.toDTO(repo.save(mapper.toEntity(dto)));
    }

    /** Update existing domain (admin/onboarding only) */
    public DomainDTO update(Long id, DomainDTO dto) {
        authorizationService.requireAdminOrOnboardingPermissions();
        DomainEntity entity = findDomainById(id);
        entity.setName(dto.getName());
        return mapper.toDTO(repo.save(entity));
    }

    /** Delete domain (admin/onboarding only) */
    public void delete(Long id) {
        authorizationService.requireAdminOrOnboardingPermissions();
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Domain not found: " + id);
        }
        repo.deleteById(id);
    }

    // Helper method

    /** Find domain by ID or throw exception */
    private DomainEntity findDomainById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found: " + id));
    }
}
