package api_toolkit.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * JWT Authentication Filter - runs before every API request.
 * Checks if user has valid JWT token and sets up security context.
 * Beginner-friendly: Shows how Spring Security filters work.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            
            // Skip if no Bearer token found
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }
            
            // Extract and validate JWT token
            String jwt = authHeader.substring(7);
            Long userId = jwtUtil.validateTokenAndGetUserId(jwt);
            
            // Set user authentication if token is valid
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId, null, new ArrayList<>() // Empty authorities for now
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                log.debug("JWT authentication successful for user ID: {}", userId);
            }
            
        } catch (Exception e) {
            log.error("JWT authentication failed: {}", e.getMessage());
            // Continue with filter chain - let Spring Security handle unauthenticated request
        }
        
        filterChain.doFilter(request, response);
    }
}
