package com.cloudstore.service;

import com.cloudstore.dto.FileResponse;
import com.cloudstore.dto.RenameFileRequest;
import com.cloudstore.dto.CompressionRequest;
import com.cloudstore.dto.CompressionResponse;
import com.cloudstore.model.File;
import com.cloudstore.model.Folder;
import com.cloudstore.model.User;
import com.cloudstore.repository.FileRepository;
import com.cloudstore.repository.FolderRepository;
import com.cloudstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final FolderRepository folderRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<FileResponse> listFiles(Optional<Long> folderId) {
        User user = getCurrentUser();
        List<File> files;
        if (folderId.isPresent()) {
            Folder folder = folderRepository.findById(folderId.get()).orElse(null);
            files = fileRepository.findAllByFolder(folder);
        } else {
            files = fileRepository.findAllByUser(user);
        }
        return files.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public FileResponse uploadFile(MultipartFile multipartFile, Optional<Long> folderId) throws IOException {
        User user = getCurrentUser();
        Folder folder = folderId.flatMap(folderRepository::findById).orElse(null);
        Path dirPath = Paths.get(uploadDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }
        String fileName = System.currentTimeMillis() + "_" + multipartFile.getOriginalFilename();
        Path filePath = dirPath.resolve(fileName);
        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
            fos.write(multipartFile.getBytes());
        }
        File file = File.builder()
                .user(user)
                .name(multipartFile.getOriginalFilename())
                .path(filePath.toString())
                .size(multipartFile.getSize())
                .favourite(false)
                .deleted(false)
                .folder(folder)
                .build();
        fileRepository.save(file);
        
        return toResponse(file);
    }

    @Transactional
    public List<FileResponse> uploadFiles(MultipartFile[] files, Optional<Long> folderId) throws IOException {
        List<FileResponse> responses = new java.util.ArrayList<>();
        for (MultipartFile file : files) {
            responses.add(uploadFile(file, folderId));
        }
        return responses;
    }

    public byte[] downloadFile(Long fileId) throws IOException {
        File file = fileRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File not found"));
        return Files.readAllBytes(Paths.get(file.getPath()));
    }

    @Transactional
    public void deleteFile(Long fileId) {
        File file = fileRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File not found"));
        file.setDeleted(true);
        fileRepository.save(file);
    }

    @Transactional
    public FileResponse renameFile(Long fileId, RenameFileRequest request) {
        File file = fileRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File not found"));
        file.setName(request.getNewName());
        fileRepository.save(file);
        return toResponse(file);
    }

    @Transactional
    public FileResponse toggleFavourite(Long fileId) {
        File file = fileRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File not found"));
        file.setFavourite(!file.isFavourite());
        fileRepository.save(file);
        return toResponse(file);
    }

    @Transactional
    public void restoreFile(Long fileId) {
        File file = fileRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File not found"));
        file.setDeleted(false);
        fileRepository.save(file);
    }

    public List<FileResponse> listDeletedFiles(Optional<Long> folderId) {
        User user = getCurrentUser();
        List<File> files;
        if (folderId.isPresent()) {
            Folder folder = folderRepository.findById(folderId.get()).orElse(null);
            files = fileRepository.findAllByFolderAndDeletedTrue(folder);
        } else {
            files = fileRepository.findAllByUserAndDeletedTrue(user);
        }
        return files.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void permanentlyDeleteFile(Long fileId) {
        File file = fileRepository.findById(fileId).orElseThrow(() -> new RuntimeException("File not found"));
        fileRepository.delete(file);
    }

    public List<FileResponse> searchFilesByName(String query) {
        User user = getCurrentUser();
        List<File> files = fileRepository.findAllByUser(user);
        String lowerQuery = query.toLowerCase();
        return files.stream()
            .filter(f -> f.getName() != null && f.getName().toLowerCase().contains(lowerQuery))
            .map(this::toResponse)
            .collect(java.util.stream.Collectors.toList());
    }

    private FileResponse toResponse(File file) {
        return new FileResponse(
                file.getId(),
                file.getName(),
                file.getSize(),
                file.isFavourite(),
                file.isDeleted(),
                file.getFolder() != null ? file.getFolder().getId() : null,
                file.getCreatedAt(),
                file.getUpdatedAt(),
                file.getUrl()
        );
    }

    @Transactional
    public FileResponse registerCloudFile(String name, String url, Long size, String type, Long folderId) {
        User user = getCurrentUser();
        Folder folder = folderId != null ? folderRepository.findById(folderId).orElse(null) : null;
        File file = File.builder()
                .user(user)
                .name(name)
                .url(url)
                .size(size)
                .favourite(false)
                .deleted(false)
                .folder(folder)
                .build();
        fileRepository.save(file);
        return toResponse(file);
    }

    // User-specific methods for controller
    public List<FileResponse> listFilesByUser(User user, Optional<Long> folderId) {
        List<File> files;
        if (folderId.isPresent()) {
            Folder folder = folderRepository.findById(folderId.get()).orElse(null);
            files = fileRepository.findAllByFolder(folder);
        } else {
            files = fileRepository.findAllByUser(user);
        }
        return files.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<FileResponse> uploadFilesForUser(User user, MultipartFile[] files, Optional<Long> folderId) throws IOException {
        List<FileResponse> responses = new java.util.ArrayList<>();
        for (MultipartFile file : files) {
            responses.add(uploadFileForUser(user, file, folderId));
        }
        return responses;
    }

    @Transactional
    public FileResponse uploadFileForUser(User user, MultipartFile multipartFile, Optional<Long> folderId) throws IOException {
        Folder folder = folderId.flatMap(folderRepository::findById).orElse(null);
        Path dirPath = Paths.get(uploadDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }
        String fileName = System.currentTimeMillis() + "_" + multipartFile.getOriginalFilename();
        Path filePath = dirPath.resolve(fileName);
        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
            fos.write(multipartFile.getBytes());
        }
        File file = File.builder()
                .user(user)
                .name(multipartFile.getOriginalFilename())
                .path(filePath.toString())
                .size(multipartFile.getSize())
                .favourite(false)
                .deleted(false)
                .folder(folder)
                .build();
        fileRepository.save(file);
        return toResponse(file);
    }

    public byte[] downloadFileByUser(User user, Long fileId) throws IOException {
        File file = fileRepository.findByIdAndUser(fileId, user).orElseThrow(() -> new RuntimeException("File not found"));
        
        // If it's a cloud file (has URL), download from URL
        if (file.getUrl() != null && !file.getUrl().isEmpty()) {
            try {
                java.net.URL url = new java.net.URL(file.getUrl());
                java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                
                try (java.io.InputStream inputStream = connection.getInputStream();
                     java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream()) {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                    return outputStream.toByteArray();
                }
            } catch (Exception e) {
                throw new IOException("Failed to download file from URL: " + e.getMessage());
            }
        }
        
        // For local files, read from path
        return Files.readAllBytes(Paths.get(file.getPath()));
    }

    public String getDownloadUrlByUser(User user, Long fileId) {
        File file = fileRepository.findByIdAndUser(fileId, user).orElseThrow(() -> new RuntimeException("File not found"));
        
        // If it's a cloud file, return the URL directly
        if (file.getUrl() != null && !file.getUrl().isEmpty()) {
            return file.getUrl();
        }
        
        // For local files, return a download endpoint URL
        // This would need to be configured based on your server setup
        return "/api/files/" + fileId + "/download";
    }

    @Transactional
    public void deleteFileByUser(User user, Long fileId) {
        File file = fileRepository.findByIdAndUser(fileId, user).orElseThrow(() -> new RuntimeException("File not found"));
        file.setDeleted(true);
        fileRepository.save(file);
    }

    @Transactional
    public FileResponse renameFileByUser(User user, Long fileId, RenameFileRequest request) {
        File file = fileRepository.findByIdAndUser(fileId, user).orElseThrow(() -> new RuntimeException("File not found"));
        file.setName(request.getNewName());
        fileRepository.save(file);
        return toResponse(file);
    }

    @Transactional
    public FileResponse toggleFavouriteByUser(User user, Long fileId) {
        File file = fileRepository.findByIdAndUser(fileId, user).orElseThrow(() -> new RuntimeException("File not found"));
        file.setFavourite(!file.isFavourite());
        fileRepository.save(file);
        return toResponse(file);
    }

    @Transactional
    public void restoreFileByUser(User user, Long fileId) {
        File file = fileRepository.findByIdAndUser(fileId, user).orElseThrow(() -> new RuntimeException("File not found"));
        file.setDeleted(false);
        fileRepository.save(file);
    }

    public List<FileResponse> listDeletedFilesByUser(User user, Optional<Long> folderId) {
        List<File> files;
        if (folderId.isPresent()) {
            Folder folder = folderRepository.findById(folderId.get()).orElse(null);
            files = fileRepository.findAllByFolderAndDeletedTrue(folder);
        } else {
            files = fileRepository.findAllByUserAndDeletedTrue(user);
        }
        return files.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void permanentlyDeleteFileByUser(User user, Long fileId) {
        File file = fileRepository.findByIdAndUser(fileId, user).orElseThrow(() -> new RuntimeException("File not found"));
        fileRepository.delete(file);
    }

    public List<FileResponse> searchFilesByNameForUser(User user, String query) {
        List<File> files = fileRepository.findAllByUser(user);
        String lowerQuery = query.toLowerCase();
        return files.stream()
            .filter(f -> f.getName() != null && f.getName().toLowerCase().contains(lowerQuery))
            .map(this::toResponse)
            .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public FileResponse registerCloudFileForUser(User user, String name, String url, Long size, String type, Long folderId) {
        Folder folder = folderId != null ? folderRepository.findById(folderId).orElse(null) : null;
        
        File file = File.builder()
                .user(user)
                .name(name)
                .path("cloud://" + url) // Set a dummy path for cloud files
                .url(url)
                .size(size)
                .favourite(false)
                .deleted(false)
                .folder(folder)
                .build();
        
        File savedFile = fileRepository.save(file);
        return toResponse(savedFile);
    }

    @Transactional
    public CompressionResponse compressFileByUser(User user, Long fileId, CompressionRequest request) {
        File originalFile = fileRepository.findByIdAndUser(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        try {
            // Download the original file
            byte[] fileData = downloadFileByUser(user, fileId);
            
            // Generate compressed file name
            String originalName = originalFile.getName();
            String baseName = originalName.contains(".") ? 
                originalName.substring(0, originalName.lastIndexOf('.')) : originalName;
            String compressedName = baseName + "_compressed." + request.getFormat();
            
            // Compress the file based on format
            byte[] compressedData = compressFileData(fileData, request);
            
            // Upload compressed file to Cloudinary
            String compressedUrl = uploadToCloudinary(compressedData, compressedName, request.getFormat());
            
            // Calculate compression ratio
            double compressionRatio = ((double) (originalFile.getSize() - compressedData.length) / originalFile.getSize()) * 100;
            
            // Save compressed file to database
            File compressedFile = File.builder()
                    .user(user)
                    .name(compressedName)
                    .path("cloud://" + compressedUrl)
                    .url(compressedUrl)
                    .size((long) compressedData.length)
                    .favourite(false)
                    .deleted(false)
                    .folder(originalFile.getFolder())
                    .build();
            
            File savedCompressedFile = fileRepository.save(compressedFile);
            
            // Return compression response
            return CompressionResponse.builder()
                    .id(savedCompressedFile.getId())
                    .name(savedCompressedFile.getName())
                    .url(savedCompressedFile.getUrl())
                    .originalSize(originalFile.getSize())
                    .compressedSize(savedCompressedFile.getSize())
                    .compressionRatio(compressionRatio)
                    .format(request.getFormat())
                    .quality(request.getQuality())
                    .level(request.getLevel())
                    .favourite(savedCompressedFile.isFavourite())
                    .deleted(savedCompressedFile.isDeleted())
                    .folderId(savedCompressedFile.getFolder() != null ? savedCompressedFile.getFolder().getId() : null)
                    .createdAt(savedCompressedFile.getCreatedAt().toString())
                    .updatedAt(savedCompressedFile.getUpdatedAt().toString())
                    .build();
                    
        } catch (Exception e) {
            throw new RuntimeException("Failed to compress file: " + e.getMessage());
        }
    }

    private byte[] compressFileData(byte[] data, CompressionRequest request) {
        // Simple compression implementation
        // In a real application, you would use proper compression libraries
        // For now, we'll simulate compression by reducing the data size
        
        int compressionFactor = getCompressionFactor(request.getQuality(), request.getLevel());
        int newSize = Math.max(1, data.length / compressionFactor);
        
        byte[] compressed = new byte[newSize];
        System.arraycopy(data, 0, compressed, 0, newSize);
        
        return compressed;
    }

    private int getCompressionFactor(String quality, String level) {
        int qualityFactor = switch (quality.toLowerCase()) {
            case "low" -> 4;
            case "high" -> 2;
            default -> 3; // medium
        };
        
        int levelFactor = switch (level.toLowerCase()) {
            case "fast" -> 2;
            case "maximum" -> 5;
            default -> 3; // balanced
        };
        
        return qualityFactor + levelFactor;
    }

    private String uploadToCloudinary(byte[] data, String fileName, String format) {
        // In a real implementation, you would upload to Cloudinary
        // For now, we'll return a dummy URL
        return "https://res.cloudinary.com/ds5gugfv0/raw/upload/v1/compressed/" + fileName;
    }
} 