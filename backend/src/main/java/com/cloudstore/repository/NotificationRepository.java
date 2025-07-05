package com.cloudstore.repository;

import com.cloudstore.model.Notification;
import com.cloudstore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByUser(User user);
} 