package com.cloudstore.dto;

import lombok.Data;

@Data
public class CompressionRequest {
    private String type; // image, video, archive
    private Float quality; // for images (0.3–0.9)
    private Integer bitrate; // for videos (kbps)
    private String format; // output format (jpg, png, mp4, zip, etc.)
} 