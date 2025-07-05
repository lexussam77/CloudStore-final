package com.cloudstore.controller;

import com.cloudstore.dto.*;
import com.cloudstore.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> resp = new HashMap<>();
        try {
            AuthResponse result = authService.register(request);
            resp.put("success", true);
            resp.put("token", result.getToken());
            resp.put("email", result.getEmail());
            resp.put("name", result.getName());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> resp = new HashMap<>();
        try {
            AuthResponse result = authService.login(request);
            resp.put("success", true);
            resp.put("token", result.getToken());
            resp.put("email", result.getEmail());
            resp.put("name", result.getName());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestBody VerifyEmailRequest request) {
        Map<String, Object> resp = new HashMap<>();
        try {
            authService.verifyEmail(request.getEmail(), request.getCode());
            resp.put("success", true);
            resp.put("message", "Email verified successfully");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Map<String, Object> resp = new HashMap<>();
        try {
            authService.forgotPassword(request.getEmail());
            resp.put("success", true);
            resp.put("message", "Password reset email sent");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        Map<String, Object> resp = new HashMap<>();
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            resp.put("success", true);
            resp.put("message", "Password reset successful");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(resp);
        }
    }
} 