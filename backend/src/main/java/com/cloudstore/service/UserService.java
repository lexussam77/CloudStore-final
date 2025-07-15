package com.cloudstore.service;

import com.cloudstore.dto.UpdateUserProfileRequest;
import com.cloudstore.dto.UserProfileResponse;
import com.cloudstore.model.User;
import com.cloudstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    private User getCurrentUserEntity() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.cloudstore.model.User) {
            return (com.cloudstore.model.User) principal;
        } else if (principal instanceof org.springframework.security.core.userdetails.User) {
            String email = ((org.springframework.security.core.userdetails.User) principal).getUsername();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else if (principal instanceof String) {
            String email = (String) principal;
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("Unknown principal type: " + principal.getClass());
    }

    public UserProfileResponse getCurrentUser() {
        User user = getCurrentUserEntity();
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateUserProfileRequest request) {
        User user = getCurrentUserEntity();
        user.setName(request.getName());
        userRepository.save(user);
        return getCurrentUser();
    }

    @Transactional
    public void deleteAccount() {
        User user = getCurrentUserEntity();
        userRepository.delete(user);
    }
} 