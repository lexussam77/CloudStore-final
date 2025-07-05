package com.cloudstore.controller;

import com.cloudstore.dto.CreateFolderRequest;
import com.cloudstore.dto.FolderResponse;
import com.cloudstore.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import com.cloudstore.model.Folder;
import com.cloudstore.model.User;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {
    private final FolderService folderService;

    @GetMapping
    public ResponseEntity<List<FolderResponse>> listFolders(@RequestParam(required = false) Long parentId) {
        return ResponseEntity.ok(folderService.listFolders(Optional.ofNullable(parentId)));
    }

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(@RequestBody CreateFolderRequest request) {
        return ResponseEntity.ok(folderService.createFolder(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FolderResponse> renameFolder(@PathVariable Long id, @RequestBody com.cloudstore.dto.CreateFolderRequest request) {
        // For simplicity, reuse CreateFolderRequest for renaming (just use name field)
        return ResponseEntity.ok(folderService.renameFolder(id, request.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        folderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/debug/all")
    public ResponseEntity<Map<String, Object>> debugAllFolders() {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = folderService.getCurrentUserForDebug();
            List<Folder> allFolders = folderService.getAllFoldersForUser(user);
            
            response.put("userId", user.getId());
            response.put("userEmail", user.getEmail());
            response.put("totalFolders", allFolders.size());
            response.put("folders", allFolders.stream().map(folder -> {
                Map<String, Object> folderInfo = new HashMap<>();
                folderInfo.put("id", folder.getId());
                folderInfo.put("name", folder.getName());
                folderInfo.put("createdAt", folder.getCreatedAt());
                folderInfo.put("parentId", folder.getParent() != null ? folder.getParent().getId() : null);
                return folderInfo;
            }).collect(Collectors.toList()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 