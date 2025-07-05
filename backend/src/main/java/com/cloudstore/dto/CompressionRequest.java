package com.cloudstore.dto;

import lombok.Data;

@Data
public class CompressionRequest {
    private String quality; // low, medium, high
    private String format;  // zip, rar, 7z
    private String level;   // fast, balanced, maximum
} 