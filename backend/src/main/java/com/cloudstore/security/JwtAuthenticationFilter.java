package com.cloudstore.security;

import com.cloudstore.model.User;
import com.cloudstore.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            email = jwtUtil.getEmailFromToken(token);
            System.out.println("JWT Filter - Token: " + token);
            System.out.println("JWT Filter - Email: " + email);
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("JWT Filter - Processing authentication for email: " + email);
            if (jwtUtil.validateToken(token)) {
                System.out.println("JWT Filter - Token is valid");
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                // Get our custom User object
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                System.out.println("JWT Filter - Found user: " + user.getEmail());
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("JWT Filter - Authentication set in context");
            } else {
                System.out.println("JWT Filter - Token is invalid");
            }
        } else {
            System.out.println("JWT Filter - Email is null or authentication already exists");
        }
        filterChain.doFilter(request, response);
    }
} 