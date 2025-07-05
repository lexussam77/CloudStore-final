package com.cloudstore.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String identifier; // can be email or username
    private String password;
} 