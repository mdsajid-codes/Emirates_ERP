package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProFinishedGood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProFinishedGoodRepository
        extends JpaRepository<ProFinishedGood, Long>, JpaSpecificationExecutor<ProFinishedGood> {
    List<ProFinishedGood> findByTenantId(Long tenantId);

    List<ProFinishedGood> findByTenantIdAndItemType(Long tenantId, com.example.multi_tanent.production.enums.ItemType itemType);

    Optional<ProFinishedGood> findByTenantIdAndId(Long tenantId, Long id);

    boolean existsByTenantIdAndItemCodeIgnoreCase(Long tenantId, String itemCode);

    boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM ProFinishedGood p " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.subCategory " +
            "LEFT JOIN FETCH p.issueUnit " +
            "LEFT JOIN FETCH p.purchaseUnit " +
            "LEFT JOIN FETCH p.tax " +
            "LEFT JOIN FETCH p.location " +
            "WHERE p.id = :id AND p.tenant.id = :tenantId")
    Optional<ProFinishedGood> findByIdWithRelations(
            @org.springframework.data.repository.query.Param("tenantId") Long tenantId,
            @org.springframework.data.repository.query.Param("id") Long id);
}
