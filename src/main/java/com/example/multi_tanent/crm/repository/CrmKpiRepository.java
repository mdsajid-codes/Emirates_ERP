package com.example.multi_tanent.crm.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.multi_tanent.crm.entity.CrmKpi;


public interface CrmKpiRepository extends JpaRepository<CrmKpi, Long> {
  @Query("SELECT k FROM CrmKpi k LEFT JOIN FETCH k.kpiEmployees LEFT JOIN FETCH k.ranges WHERE k.tenant.id = :tenantId ORDER BY k.name ASC")
  List<CrmKpi> findByTenantIdOrderByNameAsc(@Param("tenantId") Long tenantId);

  @Query("SELECT k FROM CrmKpi k LEFT JOIN FETCH k.kpiEmployees LEFT JOIN FETCH k.ranges WHERE k.id = :id AND k.tenant.id = :tenantId")
  Optional<CrmKpi> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") Long tenantId);
  boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);
}
