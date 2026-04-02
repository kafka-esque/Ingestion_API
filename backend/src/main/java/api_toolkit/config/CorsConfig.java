package api_toolkit.config;

import org.springframework.context.annotation.*;
import org.springframework.web.cors.*;
import java.util.Arrays;

/**
 * CORS Configuration - Handles Cross-Origin Resource Sharing
 * Allows frontend applications to communicate with the backend API
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow frontend development servers
        config.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",    // React default
            "http://localhost:5173",    // Vite default
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ));
        
        // Allow HTTP methods
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Allow headers for authentication and content
        config.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Requested-With", 
            "Accept", "Origin", "Access-Control-Request-Method", 
            "Access-Control-Request-Headers"
        ));
        
        config.setAllowCredentials(true);  // Allow cookies/auth
        config.setMaxAge(3600L);          // Cache preflight for 1 hour
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}