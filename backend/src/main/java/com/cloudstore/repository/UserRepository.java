package com.cloudstore.repository;

import com.cloudstore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
 
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);
} 