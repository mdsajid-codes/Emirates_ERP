package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProTaskRepository extends JpaRepository<ProTask, Long> {
    // Custom query methods can be added here
}