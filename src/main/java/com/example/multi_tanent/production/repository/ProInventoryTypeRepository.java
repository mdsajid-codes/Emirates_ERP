package com.example.multi_tanent.production.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.production.entity.ProInventoryType;

import java.util.Optional;

public interface ProInventoryTypeRepository extends JpaRepository<ProInventoryType, Long> {
    Optional<ProInventoryType> findByNameAndTenantId(String name, Long tenantId);
}
