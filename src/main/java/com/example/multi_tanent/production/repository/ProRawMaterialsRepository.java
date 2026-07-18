package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.util.Optional;

@Repository
public interface ProRawMaterialsRepository extends JpaRepository<ProRawMaterials, Long> {
    Page<ProRawMaterials> findByTenantId(Long tenantId, Pageable pageable);

    List<ProRawMaterials> findByTenantId(Long tenantId);

    Optional<ProRawMaterials> findByTenantIdAndId(Long tenantId, Long id);

    boolean existsByTenantIdAndItemCodeIgnoreCase(Long tenantId, String itemCode);

    Optional<ProRawMaterials> findByTenantIdAndItemCodeIgnoreCase(Long tenantId, String itemCode);

    Optional<ProRawMaterials> findByIdAndTenant(Long id, Tenant tenant);
}