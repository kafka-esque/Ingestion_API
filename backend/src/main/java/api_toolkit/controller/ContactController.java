package api_toolkit.controller;

import api_toolkit.dto.ContactDTO;
import api_toolkit.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Contact Controller - Handles all contact-related API endpoints
 * Provides CRUD operations for user contacts
 */
@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    // Get all contacts (admin only)
    @GetMapping
    public ResponseEntity<List<ContactDTO>> getAll() {
        return ResponseEntity.ok(contactService.getAll());
    }

    // Get current user's contacts
    @GetMapping("/my")
    public ResponseEntity<List<ContactDTO>> getMyContacts() {
        return ResponseEntity.ok(contactService.getMyContacts());
    }

    // Get contacts by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ContactDTO>> getContactsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(contactService.getContactsByUserId(userId));
    }

    // Get contact by ID
    @GetMapping("/{id}")
    public ResponseEntity<ContactDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getById(id));
    }

    // Create new contact for current user
    @PostMapping
    public ResponseEntity<ContactDTO> create(@Valid @RequestBody ContactDTO dto) {
        return ResponseEntity.ok(contactService.create(dto));
    }

    // Create contact for specific user (admin only)
    @PostMapping("/user/{userId}")
    public ResponseEntity<ContactDTO> createContactForUser(@PathVariable Long userId, @Valid @RequestBody ContactDTO dto) {
        return ResponseEntity.ok(contactService.createContactForUser(userId, dto));
    }

    // Update contact
    @PutMapping("/{id}")
    public ResponseEntity<ContactDTO> update(@PathVariable Long id, @Valid @RequestBody ContactDTO dto) {
        return ResponseEntity.ok(contactService.update(id, dto));
    }

    // Delete contact
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
