package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProTools;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProToolsRepository extends JpaRepository<ProTools, Long> {
    // Custom query methods can be added here
}