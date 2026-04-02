package api_toolkit.backend.security;

/**
 * JWT Token Provider Interface
 * 
 * Defines contract for JWT token generation and validation
 */
public interface JwtTokenProvider {
    
    /**
     * Generate JWT token for user
     */
    String generateToken(String username);

    /**
     * Validate JWT token
     */
    boolean validateToken(String token);

    /**
     * Get username from token
     */
    String getUsernameFromToken(String token);
}
