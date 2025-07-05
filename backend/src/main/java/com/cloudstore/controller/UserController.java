package com.cloudstore.controller;

import com.cloudstore.dto.UpdateUserProfileRequest;
import com.cloudstore.dto.UserProfileResponse;
import com.cloudstore.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import com.cloudstore.model.User;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestBody UpdateUserProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteAccount() {
        userService.deleteAccount();
        return ResponseEntity.ok("Account deleted successfully");
    }

    @GetMapping("/debug/current-user")
    public ResponseEntity<Map<String, Object>> getCurrentUserDebug() {
        Map<String, Object> response = new HashMap<>();
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            response.put("principalType", principal.getClass().getSimpleName());
            response.put("principal", principal.toString());
            response.put("authenticationName", SecurityContextHolder.getContext().getAuthentication().getName());
            response.put("isAuthenticated", SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
            
            if (principal instanceof User) {
                User user = (User) principal;
                response.put("userId", user.getId());
                response.put("userEmail", user.getEmail());
                response.put("userName", user.getName());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 