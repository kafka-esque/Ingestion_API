package api_toolkit.controller;

import api_toolkit.dto.DomainDTO;
import api_toolkit.service.DomainService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Domain Controller - Handles all API domain-related endpoints
 * Provides CRUD operations for domain management
 */
@RestController
@RequestMapping("/api/domain")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DomainController {

    private final DomainService service;

    // Get all domains
    @GetMapping
    public List<DomainDTO> getAll() {
        return service.getAll();
    }

    // Get domain by ID
    @GetMapping("/{id}")
    public ResponseEntity<DomainDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // Create new domain (admin/onboarding only)
    @PostMapping
    public ResponseEntity<DomainDTO> create(@Valid @RequestBody DomainDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    // Update domain (admin/onboarding only)
    @PutMapping("/{id}")
    public ResponseEntity<DomainDTO> update(@PathVariable Long id, @Valid @RequestBody DomainDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // Delete domain (admin/onboarding only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
