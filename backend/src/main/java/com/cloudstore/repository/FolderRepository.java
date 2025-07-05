package com.cloudstore.repository;

import com.cloudstore.model.Folder;
import com.cloudstore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findAllByUser(User user);
    List<Folder> findAllByParent(Folder parent);
} 