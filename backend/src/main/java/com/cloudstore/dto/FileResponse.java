package com.cloudstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileResponse {
    private Long id;
    private String name;
    private Long size;
    private boolean favourite;
    private boolean deleted;
    private Long folderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String url;
} 