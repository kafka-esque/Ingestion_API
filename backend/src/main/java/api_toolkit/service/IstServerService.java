package api_toolkit.service;

import api_toolkit.dto.IstServerDTO;
import api_toolkit.entity.IstServerEntity;
import api_toolkit.exception.ResourceNotFoundException;
import api_toolkit.mapper.IstServerMapper;
import api_toolkit.repository.IstServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * IST Server service for test server management with CRUD operations.
 * Beginner-friendly: Shows service layer patterns for server configuration management.
 */
@Service
@RequiredArgsConstructor
public class IstServerService {
    
    private final IstServerRepository repo;
    private final IstServerMapper mapper;
    private final AuthorizationService authorizationService;

    /** Get all IST servers (public access) */
    public List<IstServerDTO> getAll() {
        return repo.findAll().stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    /** Get IST server by ID */
    public IstServerDTO getById(Long id) {
        return mapper.toDTO(findServerById(id));
    }

    /** Create new IST server (admin/onboarding only) */
    public IstServerDTO create(IstServerDTO dto) {
        authorizationService.requireAdminOrOnboardingPermissions();
        IstServerEntity entity = mapper.toEntity(dto);
        return mapper.toDTO(repo.save(entity));
    }

    /** Update existing IST server (admin/onboarding only) */
    public IstServerDTO update(Long id, IstServerDTO dto) {
        authorizationService.requireAdminOrOnboardingPermissions();
        IstServerEntity entity = findServerById(id);
        entity.setName(dto.getName());
        return mapper.toDTO(repo.save(entity));
    }

    /** Delete IST server (admin/onboarding only) */
    public void delete(Long id) {
        authorizationService.requireAdminOrOnboardingPermissions();
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("IST Server not found with id: " + id);
        }
        repo.deleteById(id);
    }

    // Helper method

    /** Find IST server by ID or throw exception */
    private IstServerEntity findServerById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IST Server not found with id: " + id));
    }
}
