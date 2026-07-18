package com.example.multi_tanent.spersusers.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.multi_tanent.spersusers.enitity.CrmProduct;

public interface CrmProductRepository extends JpaRepository<CrmProduct, Long> {
    @Query("SELECT p FROM CrmProduct p JOIN FETCH p.industry WHERE p.tenant.id = :tenantId ORDER BY p.name ASC")
    List<CrmProduct> findByTenantIdOrderByNameAsc(@Param("tenantId") Long tenantId);

    @Query("SELECT p FROM CrmProduct p JOIN FETCH p.industry WHERE p.tenant.id = :tenantId AND p.industry.id = :industryId ORDER BY p.name ASC")
    List<CrmProduct> findByTenantIdAndIndustryIdOrderByNameAsc(@Param("tenantId") Long tenantId,
            @Param("industryId") Long industryId);

    @Query("SELECT p FROM CrmProduct p JOIN FETCH p.industry WHERE p.id = :id AND p.tenant.id = :tenantId")
    Optional<CrmProduct> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") Long tenantId);

    boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);
}
