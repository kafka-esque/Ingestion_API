package api_toolkit.config;

import api_toolkit.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security Configuration - Handles authentication and authorization
 * Configures JWT-based security for API endpoints
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    // Password encoder for secure password hashing
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Security filter chain with endpoint access rules
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Public authentication endpoints
                .requestMatchers(
                    "/api/auth/signup", "/api/auth/login", 
                    "/api/auth/forgot-password", "/api/auth/reset-password/**", 
                    "/api/auth/health"
                ).permitAll()
                
                // Public API endpoints
                .requestMatchers(
                    "/api/health", "/api", "/api/projects/health",
                    "/api/projects/integrity-check", "/api/operations", "/api/operations/**"
                ).permitAll()
                
                // Protected project endpoints
                .requestMatchers("/api/projects", "/api/projects/**").authenticated()
                .requestMatchers("/api/auth/user/profile").authenticated()
                
                // Development: Allow specific endpoints without authentication
                .requestMatchers(
                    "/api/users/**", "/api/contacts/**", 
                    "/api/project-contacts/**", "/api/project-operations/**"
                ).permitAll()
                
                // Protected analytics and admin endpoints
                .requestMatchers("/api/analytics/**").authenticated()
                .requestMatchers("/api/domain/**").authenticated()
                .requestMatchers("/api/domain-version/**").authenticated()
                .requestMatchers("/api/ist-server/**").authenticated()
                .requestMatchers("/api/operation-services/**").authenticated()
                
                // Default: All other API endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            );

        return http.build();
    }
}