package api_toolkit.service;

import api_toolkit.dto.UserDTO;
import api_toolkit.entity.UserEntity;
import api_toolkit.repository.UserRepository;
import api_toolkit.security.JwtUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

/**
 * Authentication service for user signup, login, and password management.
 * Beginner-friendly: Shows JWT authentication, email integration, and secure password handling.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${frontend.url}")
    private String frontendUrl;

    /** Register new user with role assignment and email validation */
    public String signup(UserDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            return "User already exists, please login.";
        }

        UserEntity user = new UserEntity();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(isFirstUserOrAdmin(dto.getEmail()) ? "ADMIN" : "USER");

        userRepository.save(user);
        log.info("User registered successfully: {}", dto.getEmail());
        return "User signed up successfully.";
    }

    /** Authenticate user and generate JWT token */
    public String login(UserDTO dto) {
        return userRepository.findByEmail(dto.getEmail())
                .map(user -> authenticateUser(dto, user))
                .orElse(logAndReturn("Login attempt with non-existent email: " + dto.getEmail(), 
                        "Invalid email or password."));
    }

    /** Send password reset email with JWT token */
    public String forgotPassword(String email) throws MessagingException {
        log.info("Password reset request for: {}", email);
        
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return logAndReturn("Password reset attempt for non-existent user: " + email, "User does not exist.");
        }

        UserEntity user = userOpt.get();
        try {
            String token = jwtUtil.generateToken(user.getId());
            String resetLink = frontendUrl + "/reset-password/" + token;
            
            sendResetEmail(email, resetLink);
            log.info("Password reset email sent successfully to: {}", email);
            return "Password reset email sent!";
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", email, e.getMessage());
            throw new MessagingException("Failed to send password reset email: " + e.getMessage());
        }
    }

    /** Reset password using valid JWT token */
    public String resetPassword(String token, String newPassword) {
        try {
            Long userId = jwtUtil.validateTokenAndGetUserId(token);
            return userRepository.findById(userId)
                    .map(user -> updatePassword(user, newPassword))
                    .orElse(logAndReturn("Password reset attempt for non-existent user ID: " + userId, 
                            "User not found."));
        } catch (Exception e) {
            log.error("Password reset failed with token validation error: {}", e.getMessage());
            return "Invalid or expired reset token.";
        }
    }

    // Helper methods - streamlined logic

    /** Check if user should get admin role (first user or admin email) */
    private boolean isFirstUserOrAdmin(String email) {
        return userRepository.count() == 0 || "admin@admin.com".equalsIgnoreCase(email);
    }

    /** Authenticate user credentials and generate token */
    private String authenticateUser(UserDTO dto, UserEntity user) {
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            return logAndReturn("Invalid password attempt for user: " + dto.getEmail(), 
                    "Invalid email or password.");
        }
        
        log.info("Successful login for user: {}", dto.getEmail());
        return jwtUtil.generateTokenWithUserInfo(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    /** Update user password and save to database */
    private String updatePassword(UserEntity user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password reset successfully for user: {}", user.getEmail());
        return "Password reset successfully.";
    }

    /** Send password reset email with HTML content */
    private void sendResetEmail(String email, String resetLink) throws MessagingException {
        MimeMessage mail = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mail, true);
        helper.setTo(email);
        helper.setSubject("Password Reset Link");
        helper.setText(String.format(
                "<p>Click below to reset your password:</p><a href=\"%s\">Reset Password</a>", 
                resetLink), true);
        mailSender.send(mail);
    }

    /** Log warning and return message (utility method) */
    private String logAndReturn(String logMessage, String returnMessage) {
        log.warn(logMessage);
        return returnMessage;
    }
}
