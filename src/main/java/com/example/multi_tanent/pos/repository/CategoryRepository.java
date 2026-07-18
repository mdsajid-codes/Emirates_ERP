package com.example.multi_tanent.pos.repository;

import com.example.multi_tanent.pos.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByTenantId(Long tenantId);
    Optional<Category> findByIdAndTenantId(Long id, Long tenantId);
}