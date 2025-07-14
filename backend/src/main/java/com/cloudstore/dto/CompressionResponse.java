package com.cloudstore.dto;

import lombok.Data;
import lombok.Builder;

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
