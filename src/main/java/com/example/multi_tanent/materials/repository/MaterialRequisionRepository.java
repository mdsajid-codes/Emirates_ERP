package com.example.multi_tanent.materials.repository;

import com.example.multi_tanent.materials.entity.MaterialRequision;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaterialRequisionRepository
        extends JpaRepository<MaterialRequision, Long>, JpaSpecificationExecutor<MaterialRequision> {
    Optional<MaterialRequision> findByTenantIdAndId(Long tenantId, Long id);

    boolean existsByTenantIdAndRequestNo(Long tenantId, String requestNo);

    boolean existsByManufacturingOrderId(Long moId);

    Optional<MaterialRequision> findByTenantIdAndManufacturingOrderId(Long tenantId, Long moId);

    Optional<MaterialRequision> findByIdAndTenant(Long id, Tenant tenant);
}
