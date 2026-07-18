package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HangerType;
import com.example.multi_tanent.hanger.enums.HangerTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HangerTypeRepository extends JpaRepository<HangerType, Long> {

    List<HangerType> findByTenant_IdAndIsActiveTrue(Long tenantId);

    List<HangerType> findByTenantTenantIdAndIsActiveTrue(String tenantId);

    Optional<HangerType> findByTenantTenantIdAndTypeName(String tenantId, HangerTypeEnum typeName);

    boolean existsByTenantTenantIdAndTypeName(String tenantId, HangerTypeEnum typeName);
}
