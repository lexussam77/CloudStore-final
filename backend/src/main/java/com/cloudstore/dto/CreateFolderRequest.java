package com.cloudstore.dto;

import lombok.Data;

@Data
public class CreateFolderRequest {
    private String name;
    private Long parentId;
} 