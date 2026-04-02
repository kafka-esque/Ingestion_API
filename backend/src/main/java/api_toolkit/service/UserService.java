package api_toolkit.service;

import api_toolkit.dto.*;
import api_toolkit.entity.UserEntity;
import api_toolkit.exception.*;
import api_toolkit.mapper.UserMapper;
import api_toolkit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user management operations.
 * Handles user CRUD operations, profile updates, and role management.
 * Provides admin-level user administration capabilities.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuthorizationService authorizationService;

    /** Create new user with role validation and admin permissions check */
    public UserDTO createUser(UserDTO dto) {
        validateEmailUniqueness(dto.getEmail(), null);
        
        String role = normalizeRole(dto.getRole());
        validateRoleAssignment(role);

        UserEntity user = userMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(role);
        
        UserEntity savedUser = userRepository.save(user);
        log.info("Created user: {} with role: {}", savedUser.getEmail(), savedUser.getRole());
        
        return createSecureDTO(savedUser);
    }

    /** Get user by ID without password information */
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return createSecureDTO(findUserById(id));
    }

    /** Get all users (Admin only) without password information */
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        authorizationService.requireAdminPermissions();
        return mapToSecureDTO(userRepository.findAll());
    }

    /** Update a user - only allows self-editing */
    public UserDTO updateUser(Long id, UserDTO dto) {
        UserEntity existingUser = findUserById(id);
        
        // Only allow self-editing - user can only edit their own profile
        authorizationService.requireSelfOrThrow(id);
        
        validateEmailUniqueness(dto.getEmail(), existingUser.getEmail());
        
        // For self-editing, preserve the current role (users cannot change their own role)
        String currentRole = existingUser.getRole();

        updateUserFields(existingUser, dto, currentRole);
        UserEntity updatedUser = userRepository.save(existingUser);
        
        return createSecureDTO(updatedUser);
    }

    /** Delete user by ID (Admin only) */
    public void deleteUser(Long id) {
        authorizationService.requireAdminPermissions();
        
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    /** Get user by email */
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return createSecureDTO(user);
    }

    /** Check if user exists by email */
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    /** Get all valid user roles (Admin only) */
    @Transactional(readOnly = true)
    public List<String> getValidRoles() {
        authorizationService.requireAdminPermissions();
        return List.of("USER", "ADMIN", "ONBOARDING");
    }

    /** Assign role to user (Admin only) */
    public UserDTO assignRole(Long userId, String role) {
        authorizationService.requireAdminPermissions();
        
        UserEntity user = findUserById(userId);
        String normalizedRole = validateAndNormalizeRole(role);
        
        user.setRole(normalizedRole);
        UserEntity updatedUser = userRepository.save(user);
        
        return createSecureDTO(updatedUser);
    }

    /** Update user profile with optional password change - only allows self-editing */
    public UserDTO updateProfile(Long userId, ProfileUpdateDTO profileDTO) {
        // Only allow self-editing
        authorizationService.requireSelfOrThrow(userId);
        
        UserEntity existingUser = findUserById(userId);
        validateEmailUniqueness(profileDTO.getEmail(), existingUser.getEmail());

        updateProfileFields(existingUser, profileDTO);
        UserEntity updatedUser = userRepository.save(existingUser);
        
        return createSecureDTO(updatedUser);
    }

    // Helper methods - streamlined validation and operations

    /** Find user by ID or throw exception */
    private UserEntity findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    /** Validate email uniqueness */
    private void validateEmailUniqueness(String email, String currentEmail) {
        if (userRepository.findByEmail(email).isPresent() && 
            (currentEmail == null || !currentEmail.equals(email))) {
            throw new ResourceConflictException("Email already exists: " + email);
        }
    }

    /** Normalize role to uppercase, default to USER */
    private String normalizeRole(String role) {
        return role != null ? role.toUpperCase() : "USER";
    }

    /** Validate role assignment permissions */
    private void validateRoleAssignment(String role) {
        if ("ADMIN".equals(role) || "ONBOARDING".equals(role)) {
            authorizationService.requireAdminPermissions();
        }
    }

    /** Validate and normalize role with validation */
    private String validateAndNormalizeRole(String role) {
        String normalizedRole = role.toUpperCase();
        List<String> validRoles = List.of("USER", "ADMIN", "ONBOARDING");
        
        if (!validRoles.contains(normalizedRole)) {
            throw new IllegalArgumentException("Invalid role: " + role + ". Valid roles are: " + validRoles);
        }
        return normalizedRole;
    }

    /** Update user fields from DTO */
    private void updateUserFields(UserEntity user, UserDTO dto, String role) {
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(role);
        
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
    }

    /** Update profile fields with password validation */
    private void updateProfileFields(UserEntity user, ProfileUpdateDTO profileDTO) {
        user.setName(profileDTO.getName());
        user.setEmail(profileDTO.getEmail());
        
        if (profileDTO.getPassword() != null && !profileDTO.getPassword().isEmpty()) {
            validateCurrentPassword(profileDTO.getCurrentPassword(), user.getPassword());
            user.setPassword(passwordEncoder.encode(profileDTO.getPassword()));
        }
    }

    /** Validate current password for profile updates */
    private void validateCurrentPassword(String currentPassword, String storedPassword) {
        if (currentPassword == null || currentPassword.isEmpty()) {
            throw new IllegalArgumentException("Current password is required to change password");
        }
        
        if (!passwordEncoder.matches(currentPassword, storedPassword)) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
    }

    /** Create secure DTO without password */
    private UserDTO createSecureDTO(UserEntity user) {
        UserDTO dto = userMapper.toDTO(user);
        dto.setPassword(null);
        return dto;
    }

    /** Convert entity list to secure DTO list */
    private List<UserDTO> mapToSecureDTO(List<UserEntity> users) {
        return users.stream()
                .map(this::createSecureDTO)
                .collect(Collectors.toList());
    }
}