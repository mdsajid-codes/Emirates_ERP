package com.example.multi_tanent.tenant.base.repository;

import com.example.multi_tanent.tenant.base.entity.WorkType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkTypeRepository extends JpaRepository<WorkType, Long> {
    Optional<WorkType> findByCode(String code);
    Optional<WorkType> findByName(String name);
}