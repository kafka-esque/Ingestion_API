package api_toolkit.controller;

import api_toolkit.dto.IstServerDTO;
import api_toolkit.service.IstServerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * IST Server Controller - Handles all test server-related endpoints
 * Provides CRUD operations for server management
 */
@RestController
@RequestMapping("/api/ist-server")
@RequiredArgsConstructor
public class IstServerController {

    private final IstServerService service;

    // Get all IST servers
    @GetMapping
    public List<IstServerDTO> getAll() {
        return service.getAll();
    }

    // Get server by ID
    @GetMapping("/{id}")
    public ResponseEntity<IstServerDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // Create new server (admin only)
    @PostMapping
    public ResponseEntity<IstServerDTO> create(@Valid @RequestBody IstServerDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    // Update server (admin only)
    @PutMapping("/{id}")
    public ResponseEntity<IstServerDTO> update(@PathVariable Long id, @Valid @RequestBody IstServerDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // Delete server (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
