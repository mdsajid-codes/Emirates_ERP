package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProToolCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProToolCategoryRepository extends JpaRepository<ProToolCategory, Long> {
    // Custom query methods can be added here if needed
}