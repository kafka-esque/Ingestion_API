package api_toolkit.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Security Configuration for Password Encoding
 * 
 * Implements proper password hashing using BCrypt algorithm
 * for secure credential storage.
 */
@Configuration
public class SecurityConfig {

    /**
     * Password encoder bean using BCrypt
     * 
     * BCrypt automatically handles salt generation and provides
     * strong password hashing with configurable strength.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strength: 12 (high security)
    }
}
