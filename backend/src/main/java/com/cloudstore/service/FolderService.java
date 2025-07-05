package com.cloudstore.service;

import com.cloudstore.dto.CreateFolderRequest;
import com.cloudstore.dto.FolderResponse;
import com.cloudstore.model.Folder;
import com.cloudstore.model.User;
import com.cloudstore.repository.FolderRepository;
import com.cloudstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderService {
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        } else {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        }
    }

    public List<FolderResponse> listFolders(Optional<Long> parentId) {
        User user = getCurrentUser();
        List<Folder> folders;
        if (parentId.isPresent()) {
            Folder parent = folderRepository.findById(parentId.get()).orElse(null);
            folders = folderRepository.findAllByParent(parent);
        } else {
            folders = folderRepository.findAllByUser(user);
        }
        return folders.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public FolderResponse createFolder(CreateFolderRequest request) {
        try {
            User user = getCurrentUser();
            Folder parent = request.getParentId() != null ? folderRepository.findById(request.getParentId()).orElse(null) : null;
            Folder folder = Folder.builder()
                    .user(user)
                    .name(request.getName())
                    .parent(parent)
                    .build();
            folderRepository.save(folder);
            return toResponse(folder);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create folder: " + e.getMessage(), e);
        }
    }

    @Transactional
    public FolderResponse renameFolder(Long id, String newName) {
        Folder folder = folderRepository.findById(id).orElseThrow(() -> new RuntimeException("Folder not found"));
        folder.setName(newName);
        folderRepository.save(folder);
        return toResponse(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        Folder folder = folderRepository.findById(id).orElseThrow(() -> new RuntimeException("Folder not found"));
        folderRepository.delete(folder);
    }

    private FolderResponse toResponse(Folder folder) {
        return new FolderResponse(
                folder.getId(),
                folder.getName(),
                folder.getParent() != null ? folder.getParent().getId() : null,
                folder.getCreatedAt(),
                folder.getUpdatedAt()
        );
    }

    public User getCurrentUserForDebug() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
    
    public List<Folder> getAllFoldersForUser(User user) {
        return folderRepository.findAllByUser(user);
    }
} 