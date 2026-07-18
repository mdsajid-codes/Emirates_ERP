package com.example.multi_tanent.tenant.base.repository;

import com.example.multi_tanent.tenant.base.entity.BaseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaseCategoryRepository extends JpaRepository<BaseCategory, Long> {
    // You can add custom query methods here if needed
}