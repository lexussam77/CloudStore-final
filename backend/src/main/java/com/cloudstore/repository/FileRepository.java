package com.cloudstore.repository;

import com.cloudstore.model.File;
import com.cloudstore.model.User;
import com.cloudstore.model.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<File, Long> {
    List<File> findAllByUser(User user);
    List<File> findAllByFolder(Folder folder);
    List<File> findAllByUserAndDeletedTrue(User user);
    List<File> findAllByFolderAndDeletedTrue(Folder folder);
    Optional<File> findByIdAndUser(Long id, User user);
} 