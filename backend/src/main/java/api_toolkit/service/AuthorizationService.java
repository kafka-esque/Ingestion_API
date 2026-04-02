package api_toolkit.service;

import api_toolkit.entity.UserEntity;
import api_toolkit.exception.ResourceNotFoundException;
import api_toolkit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.Arrays;

/**
 * Authorization service for role-based access control and user management.
 * Beginner-friendly: Shows Spring Security integration and RBAC patterns.
 */
@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserRepository userRepository;

    /** Require admin or onboarding permissions - throws exception if not authorized */
    public void requireAdminOrOnboardingPermissions() {
        if (!hasAnyRole("ADMIN", "ONBOARDING")) {
            throw new AccessDeniedException("Access denied. Only ADMIN and ONBOARDING team members can perform this operation.");
        }
    }

    /** Require admin permissions - throws exception if not authorized */
    public void requireAdminPermissions() {
        if (!hasAnyRole("ADMIN")) {
            throw new AccessDeniedException("Access denied. Only ADMIN users can perform this operation.");
        }
    }

    /** Check if current user has admin or onboarding permissions (no exception) */
    public boolean hasAdminOrOnboardingPermissions() {
        return hasAnyRole("ADMIN", "ONBOARDING");
    }

    /** Get current authenticated user */
    public UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        Long userId = (Long) auth.getPrincipal();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    /** Get user by ID (admin/onboarding only) */
    public UserEntity getUserById(Long userId) {
        requireAdminOrOnboardingPermissions();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    /** Check if current user has any of the specified roles */
    public boolean hasAnyRole(String... allowedRoles) {
        try {
            String userRole = getCurrentUser().getRole().toUpperCase();
            return Arrays.stream(allowedRoles)
                    .anyMatch(role -> role.toUpperCase().equals(userRole));
        } catch (Exception e) {
            return false;
        }
    }

    /** Require that the current user is editing their own profile */
    public void requireSelfOrThrow(Long targetUserId) {
        UserEntity currentUser = getCurrentUser();
        if (!currentUser.getId().equals(targetUserId)) {
            throw new AccessDeniedException("Access denied. You can only edit your own profile.");
        }
    }
}
