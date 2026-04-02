package api_toolkit.controller;

import api_toolkit.dto.DomainVersionDTO;
import api_toolkit.service.DomainVersionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for domain version management.
 * Handles version control for domain configurations.
 * Provides CRUD operations for domain version tracking.
 */
@RestController
@RequestMapping("/api/domain-version")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class DomainVersionController {

    private final DomainVersionService service;

    /**
     * Get all domain versions.
     */
    @GetMapping
    public List<DomainVersionDTO> getAll() {
        log.debug("Fetching all domain versions");
        return service.getAll();
    }

    /**
     * Get domain version by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DomainVersionDTO> getById(@PathVariable Long id) {
        log.debug("Fetching domain version with ID: {}", id);
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Create new domain version.
     */
    @PostMapping
    public ResponseEntity<DomainVersionDTO> create(@Valid @RequestBody DomainVersionDTO dto) {
        log.debug("Creating domain version for domain ID: {}", dto.getDomainId());
        return ResponseEntity.ok(service.create(dto));
    }

    /**
     * Update existing domain version.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DomainVersionDTO> update(@PathVariable Long id, @Valid @RequestBody DomainVersionDTO dto) {
        log.debug("Updating domain version with ID: {}", id);
        return ResponseEntity.ok(service.update(id, dto));
    }

    /**
     * Delete domain version by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("Deleting domain version with ID: {}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all versions for specific domain.
     */
    @GetMapping("/domain/{domainId}")
    public ResponseEntity<List<DomainVersionDTO>> getVersionsByDomainId(@PathVariable Long domainId) {
        try {
            log.debug("Fetching versions for domain ID: {}", domainId);
            List<DomainVersionDTO> versions = service.getVersionsByDomainId(domainId);
            return ResponseEntity.ok(versions);
        } catch (Exception e) {
            log.error("Error fetching versions for domain ID {}: {}", domainId, e.getMessage());
            throw e;
        }
    }

    /**
     * Test endpoint to verify domain existence and version count.
     */
    @GetMapping("/test/domain/{domainId}")
    public ResponseEntity<String> testDomainExists(@PathVariable Long domainId) {
        try {
            boolean domainExists = service.checkDomainExists(domainId);
            if (!domainExists) {
                return ResponseEntity.ok("Domain with ID " + domainId + " does not exist");
            }

            long versionCount = service.countVersionsByDomainId(domainId);
            return ResponseEntity.ok("Domain " + domainId + " exists with " + versionCount + " versions");
        } catch (Exception e) {
            log.error("Error testing domain {}: {}", domainId, e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
