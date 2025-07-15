package com.cloudstore.service;

import com.cloudstore.dto.CompressionRequest;
import com.cloudstore.dto.CompressionResponse;
import com.cloudstore.dto.FileResponse;
import com.cloudstore.dto.RenameFileRequest;
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
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
@RequiredArgsConstructor
public class FileService {
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final FolderRepository folderRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${CLOUDINARY_URL:}")
    private String cloudinaryUrl;

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
        boolean isCompressed = file.getName() != null && file.getName().contains("_compressed");
        return new FileResponse(
                file.getId(),
                file.getName(),
                file.getSize(),
                file.isFavourite(),
                file.isDeleted(),
                file.getFolder() != null ? file.getFolder().getId() : null,
                file.getCreatedAt(),
                file.getUpdatedAt(),
                file.getUrl(),
                isCompressed
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

    public File getFileById(Long id) {
        return fileRepository.findById(id)
            .filter(file -> !file.isDeleted()) // Only return non-deleted files
            .orElse(null);
    }

    private Cloudinary getCloudinary() {
        if (cloudinaryUrl != null && !cloudinaryUrl.isEmpty()) {
            return new Cloudinary(cloudinaryUrl);
        }
        // fallback to explicit config if env var is not set
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", "ds5gugfv0",
            "api_key", "735146938571227",
            "api_secret", "ywd7M8seRHCTf4YG6liBeN8Bw3E"
        ));
    }

    public CompressionResponse compressFile(User user, Long fileId, CompressionRequest request) {
        File originalFile = fileRepository.findByIdAndUser(fileId, user)
                .orElseThrow(() -> new RuntimeException("File not found"));
        String originalName = originalFile.getName();
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase() : "";
        String type = request.getType();
        try {
            byte[] fileData = downloadFileByUser(user, fileId);
            byte[] compressedData;
            String compressedName;
            String format = request.getFormat();
            float quality = request.getQuality() != null ? request.getQuality() : 0.7f;
            int bitrate = request.getBitrate() != null ? request.getBitrate() : 1000; // kbps default
            if ("image".equalsIgnoreCase(type)) {
                String usedFormat = (format != null && !format.isEmpty()) ? format : extension;
                int dotIndex = originalName.lastIndexOf('.');
                if (dotIndex != -1) {
                    compressedName = originalName.substring(0, dotIndex) + "_compressed." + usedFormat;
                } else {
                    compressedName = originalName + "_compressed." + usedFormat;
                }
                java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(fileData);
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                net.coobird.thumbnailator.Thumbnails.of(bais)
                    .scale(1.0)
                    .outputQuality(quality)
                    .outputFormat(usedFormat)
                    .toOutputStream(baos);
                compressedData = baos.toByteArray();
                format = usedFormat;
            } else if ("video".equalsIgnoreCase(type)) {
                String usedFormat = (format != null && !format.isEmpty()) ? format : extension;
                int dotIndex = originalName.lastIndexOf('.');
                if (dotIndex != -1) {
                    compressedName = originalName.substring(0, dotIndex) + "_compressed." + usedFormat;
                } else {
                    compressedName = originalName + "_compressed." + usedFormat;
                }
                java.nio.file.Path tempInput = java.nio.file.Files.createTempFile("video_input", "." + extension);
                java.nio.file.Path tempOutput = java.nio.file.Files.createTempFile("video_output", "." + usedFormat);
                java.nio.file.Files.write(tempInput, fileData);
                String bitrateStr = bitrate + "k";
                ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", tempInput.toString(), "-b:v", bitrateStr, tempOutput.toString()
                );
                pb.redirectErrorStream(true);
                Process process = pb.start();
                process.waitFor();
                compressedData = java.nio.file.Files.readAllBytes(tempOutput);
                java.nio.file.Files.deleteIfExists(tempInput);
                java.nio.file.Files.deleteIfExists(tempOutput);
                format = usedFormat;
            } else if ("archive".equalsIgnoreCase(type)) {
                int dotIndex = originalName.lastIndexOf('.');
                if (dotIndex != -1) {
                    compressedName = originalName.substring(0, dotIndex) + "_compressed.zip";
                } else {
                    compressedName = originalName + "_compressed.zip";
                }
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                java.util.zip.ZipOutputStream zos = new java.util.zip.ZipOutputStream(baos);
                zos.putNextEntry(new java.util.zip.ZipEntry(originalName));
                zos.write(fileData);
                zos.closeEntry();
                zos.close();
                compressedData = baos.toByteArray();
                format = "zip";
            } else {
                throw new RuntimeException("Unsupported compression type");
            }
            // Upload compressed file to Cloudinary
            Cloudinary cloudinary = getCloudinary();
            java.util.Map uploadResult = cloudinary.uploader().upload(compressedData, ObjectUtils.asMap(
                "resource_type", "auto",
                "public_id", compressedName
            ));
            String fileUrl = (String) uploadResult.get("secure_url");
            File compressedFile = File.builder()
                    .user(user)
                    .name(compressedName)
                    .url(fileUrl)
                    .size((long) compressedData.length)
                    .favourite(false)
                    .deleted(false)
                    .folder(originalFile.getFolder())
                    .path(null)
                    .build();
            fileRepository.save(compressedFile);
            double compressionRatio = ((double) (originalFile.getSize() - compressedData.length) / originalFile.getSize()) * 100;
            return CompressionResponse.builder()
                    .id(compressedFile.getId())
                    .name(compressedFile.getName())
                    .url(compressedFile.getUrl())
                    .originalSize(originalFile.getSize())
                    .compressedSize(compressedFile.getSize())
                    .compressionRatio(compressionRatio)
                    .format(format)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Compression failed: " + e.getMessage());
        }
    }
} 