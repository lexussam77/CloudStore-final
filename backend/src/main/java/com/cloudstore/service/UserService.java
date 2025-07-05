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
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
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