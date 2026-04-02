package api_toolkit.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * JWT Token Manager - handles all JWT operations.
 * Creates secure tokens for user authentication and authorization.
 * Beginner-friendly: Shows how JWT tokens work in Spring Boot.
 */
@Component
@Slf4j
public class JwtUtil {
    
    private static final String SECRET_KEY = "your_secret_key_here_should_be_at_least_32_bytes_long";
    private static final long TOKEN_VALIDITY = 86400000; // 24 hours

    /**
     * Create basic JWT token for user login.
     */
    public String generateToken(Long userId) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Create JWT token with user details (name, email, role).
     */
    public String generateTokenWithUserInfo(Long userId, String name, String email, String role) {
        return Jwts.builder()
                .setClaims(Map.of("name", name, "email", email, "role", role))
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract user ID from JWT token.
     */
    public Long validateTokenAndGetUserId(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    /**
     * Extract user role from JWT token.
     */
    public String getRoleFromToken(String token) {
        return (String) getClaims(token).get("role");
    }

    // Helper method to create signing key
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // Helper method to parse token and get claims
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
