package com.cloudstore.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompressionResponse {
    private Long id;
    private String name;
    private String url;
    private Long originalSize;
    private Long compressedSize;
    private Double compressionRatio;
    private String format;
}
