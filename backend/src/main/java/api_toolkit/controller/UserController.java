package api_toolkit.controller;

import api_toolkit.dto.*;
import api_toolkit.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User Controller - Demonstrates complete user management operations.
 * 
 * Educational Focus:
 * - CRUD operations with proper HTTP methods and status codes
 * - Input validation with @Valid
 * - Role-based access control patterns
 * - RESTful API design principles
 * - Clean separation of concerns (controller -> service -> repository)
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class UserController {

    private final UserService userService;

    // === CRUD Operations ===

    /** Create a new user */
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserDTO userDTO) {
        log.debug("Creating user with email: {}", userDTO.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDTO));
    }

    /** Get user by ID */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /** Get user by email */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    /** Get all users (Admin only) */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** Update user by ID - Only allows self-editing */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        log.debug("Updating user with ID: {}", id);
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }

    /** Delete user by ID (Admin only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // === Utility Endpoints ===

    /** Check if user exists by email */
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        return ResponseEntity.ok(userService.existsByEmail(email));
    }

    /** Get users count (Admin only) */
    @GetMapping("/count")
    public ResponseEntity<Integer> getUsersCount() {
        return ResponseEntity.ok(userService.getAllUsers().size());
    }

    /** Get all valid user roles (Admin only) */
    @GetMapping("/roles")
    public ResponseEntity<List<String>> getValidRoles() {
        return ResponseEntity.ok(userService.getValidRoles());
    }

    /** Health check endpoint */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("User service is running");
    }

    // === Advanced Operations ===

    /** Assign role to user (Admin only) */
    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> assignRole(@PathVariable Long id, @RequestBody RoleRequest roleRequest) {
        return ResponseEntity.ok(userService.assignRole(id, roleRequest.role));
    }

    /** Update user profile with optional password change */
    @PutMapping("/{id}/profile")
    public ResponseEntity<UserDTO> updateProfile(@PathVariable Long id, @Valid @RequestBody ProfileUpdateDTO profileDTO) {
        return ResponseEntity.ok(userService.updateProfile(id, profileDTO));
    }

    /**
     * Role assignment request - Simple record for better maintainability
     */
    public record RoleRequest(String role) {}
}
