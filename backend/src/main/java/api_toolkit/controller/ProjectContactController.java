package api_toolkit.controller;

import api_toolkit.dto.ProjectContactDTO;
import api_toolkit.service.ProjectContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/project-contacts")
@CrossOrigin(origins = "*")
public class ProjectContactController {

    @Autowired
    private ProjectContactService projectContactService;

    @GetMapping
    public ResponseEntity<List<ProjectContactDTO>> getAllMappings() {
        return ResponseEntity.ok(projectContactService.getAllMappings());
    }

    @PostMapping
    public ResponseEntity<ProjectContactDTO> addMapping(@Valid @RequestBody ProjectContactDTO dto) {
        return ResponseEntity.ok(projectContactService.addMapping(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMapping(@PathVariable Long id) {
        projectContactService.deleteMapping(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectContactDTO>> getContactsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectContactService.getContactsByProjectId(projectId));
    }

    @PostMapping("/project/{projectId}/contacts")
    public ResponseEntity<List<ProjectContactDTO>> addContactsToProject(
            @PathVariable Long projectId,
            @RequestBody List<Long> contactIds) {
        return ResponseEntity.ok(projectContactService.addContactsToProject(projectId, contactIds));
    }
}
