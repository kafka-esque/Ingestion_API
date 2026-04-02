package api_toolkit.controller;

import api_toolkit.dto.UserDTO;
import api_toolkit.entity.UserEntity;
import api_toolkit.repository.UserRepository;
import api_toolkit.security.JwtUtil;
import api_toolkit.service.AuthService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST Controller for user authentication operations.
 * Beginner-friendly: Shows JWT authentication, error handling, and REST patterns.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    /** Register a new user account */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserDTO userDTO) {
        log.debug("Signup request for email: {}", userDTO.getEmail());
        String result = authService.signup(userDTO);
        return createResponseBasedOnResult(result, 400);
    }

    /** Authenticate user and generate JWT token */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        log.debug("Login attempt for email: {}", userDTO.getEmail());
        String result = authService.login(userDTO);
        
        if (isErrorResult(result)) {
            return ResponseEntity.status(401).body(result);
        }
        return result.contains(".") ? ResponseEntity.ok(result) 
                                   : ResponseEntity.status(401).body("Authentication failed");
    }

    /** Send password reset email to user */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody UserDTO userDTO) {
        try {
            log.info("Password reset request for: {}", userDTO.getEmail());
            String result = authService.forgotPassword(userDTO.getEmail());
            
            if (result.contains("does not exist")) {
                log.warn("User not found: {}", userDTO.getEmail());
                return ResponseEntity.status(404).body(result);
            }
            
            if (isErrorResult(result)) {
                log.error("Error in password reset: {}", result);
                return ResponseEntity.status(500).body(result);
            }
            
            log.info("Password reset email sent to: {}", userDTO.getEmail());
            return ResponseEntity.ok(result);
        } catch (MessagingException e) {
            log.error("Email sending failed: {}", e.getMessage());
            return ResponseEntity.status(500).body("Failed to send password reset email. Please try again later.");
        } catch (Exception e) {
            log.error("Unexpected error in password reset: {}", e.getMessage());
            return ResponseEntity.status(500).body("An unexpected error occurred. Please try again later.");
        }
    }

    /** Reset user password using token */
    @PostMapping("/reset-password/{token}")
    public ResponseEntity<?> resetPassword(@PathVariable String token, @RequestBody UserDTO userDTO) {
        try {
            log.debug("Password reset attempt with token");
            String result = authService.resetPassword(token, userDTO.getPassword());
            return createResponseBasedOnResult(result, 400);
        } catch (Exception e) {
            log.error("Password reset failed: {}", e.getMessage());
            return ResponseEntity.status(400).body("Invalid or expired reset token");
        }
    }

    /** Health check endpoint for service monitoring */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP", "message", "Server is running"));
    }

    /** Get current user profile information */
    @GetMapping("/user/profile")
    public ResponseEntity<?> getUserProfile(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            Long userId = jwtUtil.validateTokenAndGetUserId(token);
            
            Optional<UserEntity> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }
            
            return createUserProfileResponse(userOpt.get());
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    // Helper methods for cleaner code and reusability

    /** Check if result indicates an error */
    private boolean isErrorResult(String result) {
        return result.contains("already exists") || result.contains("error") || 
               result.contains("failed") || result.contains("not found") || 
               result.startsWith("Invalid");
    }

    /** Create response based on result string */
    private ResponseEntity<?> createResponseBasedOnResult(String result, int errorStatus) {
        return isErrorResult(result) ? ResponseEntity.status(errorStatus).body(result) 
                                     : ResponseEntity.ok(result);
    }

    /** Extract JWT token from Authorization header */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid authorization header");
        }
        return authHeader.substring(7);
    }

    /** Create user profile response map */
    private ResponseEntity<?> createUserProfileResponse(UserEntity user) {
        Map<String, Object> userProfile = Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        );
        return ResponseEntity.ok(userProfile);
    }
}
