package com.cloudstore.controller;

import com.cloudstore.dto.CompressionRequest;
import com.cloudstore.dto.CompressionResponse;
import com.cloudstore.dto.FileResponse;
import com.cloudstore.dto.RegisterCloudFileRequest;
import com.cloudstore.model.User;
import com.cloudstore.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    // List all files for the authenticated user
    @GetMapping("")
    public ResponseEntity<List<FileResponse>> listFiles(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long folderId) {
        return ResponseEntity.ok(fileService.listFilesByUser(user, Optional.ofNullable(folderId)));
    }

    // Upload multiple files for the authenticated user
    @PostMapping("/upload")
    public ResponseEntity<List<FileResponse>> uploadFiles(
            @AuthenticationPrincipal User user,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folderId", required = false) Long folderId) throws java.io.IOException {
        return ResponseEntity.ok(fileService.uploadFilesForUser(user, files, Optional.ofNullable(folderId)));
    }

    // Soft-delete a file (only if owned by user)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        fileService.deleteFileByUser(user, id);
        return ResponseEntity.ok().build();
    }

    // Rename a file (only if owned by user)
    @PostMapping("/rename/{id}")
    public ResponseEntity<FileResponse> renameFile(
            @AuthenticationPrincipal User user,
            @PathVariable Long id, 
            @RequestBody com.cloudstore.dto.RenameFileRequest request) {
        return ResponseEntity.ok(fileService.renameFileByUser(user, id, request));
    }

    // Toggle favorite (only if owned by user)
    @PostMapping("/favorite/{id}")
    public ResponseEntity<FileResponse> favoriteFile(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(fileService.toggleFavouriteByUser(user, id));
    }

    // Download a file (only if owned by user)
    @GetMapping("/{id}/download")
    public org.springframework.http.ResponseEntity<byte[]> downloadFile(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) throws java.io.IOException {
        byte[] data = fileService.downloadFileByUser(user, id);
        return org.springframework.http.ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"file_" + id + "\"")
                .body(data);
    }

    // Get download URL for a file (only if owned by user)
    @GetMapping("/{id}/download-url")
    public ResponseEntity<Map<String, String>> getDownloadUrl(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        String downloadUrl = fileService.getDownloadUrlByUser(user, id);
        return ResponseEntity.ok(Map.of("url", downloadUrl));
    }

    // List deleted files for the authenticated user
    @GetMapping("/deleted")
    public ResponseEntity<List<FileResponse>> listDeletedFiles(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long folderId) {
        return ResponseEntity.ok(fileService.listDeletedFilesByUser(user, Optional.ofNullable(folderId)));
    }

    // Restore a deleted file (only if owned by user)
    @PostMapping("/restore/{id}")
    public ResponseEntity<Void> restoreFile(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        fileService.restoreFileByUser(user, id);
        return ResponseEntity.ok().build();
    }

    // Permanently delete a file (only if owned by user)
    @DeleteMapping("/permanent/{id}")
    public ResponseEntity<Void> permanentlyDeleteFile(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        fileService.permanentlyDeleteFileByUser(user, id);
        return ResponseEntity.ok().build();
    }

    // Search files by name (only for authenticated user)
    @GetMapping("/search")
    public ResponseEntity<List<FileResponse>> searchFiles(
            @AuthenticationPrincipal User user,
            @RequestParam("query") String query) {
        return ResponseEntity.ok(fileService.searchFilesByNameForUser(user, query));
    }

    // Register a cloud file for the authenticated user
    @PostMapping("/register")
    public ResponseEntity<FileResponse> registerCloudFile(
            @AuthenticationPrincipal User user,
            @RequestBody RegisterCloudFileRequest request) {
        FileResponse response = fileService.registerCloudFileForUser(
            user,
            request.getName(),
            request.getUrl(),
            request.getSize(),
            request.getType(),
            request.getFolderId()
        );
        return ResponseEntity.ok(response);
    }

    // Public download endpoint (no authentication required)
    @GetMapping("/{id}/public-download")
    public org.springframework.http.ResponseEntity<?> publicDownloadFile(@PathVariable Long id) throws java.io.IOException {
        // Use a new method in FileService that does not require a user
        var file = fileService.getFileById(id);
        if (file == null) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        if (file.getUrl() != null && !file.getUrl().isEmpty()) {
            // Redirect to cloud URL
            return org.springframework.http.ResponseEntity.status(302)
                .header("Location", file.getUrl())
                .build();
        } else {
            // Serve local file bytes
            byte[] data = fileService.downloadFile(id);
            return org.springframework.http.ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"")
                .body(data);
        }
    }

    @PostMapping("/{id}/compress")
    public ResponseEntity<CompressionResponse> compressFile(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody CompressionRequest request) {
        CompressionResponse response = fileService.compressFile(user, id, request);
        return ResponseEntity.ok(response);
    }
} 