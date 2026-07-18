package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ManufacturingOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ManufacturingOrderRepository
                extends JpaRepository<ManufacturingOrder, Long>, JpaSpecificationExecutor<ManufacturingOrder> {
        Page<ManufacturingOrder> findByTenantId(Long tenantId, Pageable pageable);

        java.util.List<ManufacturingOrder> findByTenantId(Long tenantId);

        Optional<ManufacturingOrder> findByTenantIdAndId(Long tenantId, Long id);

        Optional<ManufacturingOrder> findByIdAndTenantId(Long id, Long tenantId);

        boolean existsByTenantIdAndMoNumber(Long tenantId, String moNumber);

        Page<ManufacturingOrder> findByTenantIdAndAssignToId(Long tenantId, Long assignToId, Pageable pageable);

        long countByTenantId(Long tenantId);

        long countByTenantIdAndStatus(Long tenantId,
                        com.example.multi_tanent.production.enums.ManufacturingOrderStatus status);

        @org.springframework.data.jpa.repository.Query("SELECT mo.status, COUNT(mo) FROM ManufacturingOrder mo WHERE mo.tenant.id = :tenantId GROUP BY mo.status")
        java.util.List<Object[]> countByStatusForTenant(Long tenantId);

        @org.springframework.data.jpa.repository.Query("SELECT mo FROM ManufacturingOrder mo WHERE mo.tenant.id = :tenantId ORDER BY mo.createdAt DESC")
        java.util.List<ManufacturingOrder> findTop5ByTenantIdOrderByCreatedAtDesc(Long tenantId,
                        org.springframework.data.domain.Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT mo.status, COUNT(mo) FROM ManufacturingOrder mo WHERE mo.tenant.id = :tenantId AND mo.createdAt BETWEEN :from AND :to GROUP BY mo.status")
        java.util.List<Object[]> countByStatusForTenantBetween(
                        @org.springframework.data.repository.query.Param("tenantId") Long tenantId,
                        @org.springframework.data.repository.query.Param("from") java.time.OffsetDateTime from,
                        @org.springframework.data.repository.query.Param("to") java.time.OffsetDateTime to);

        @org.springframework.data.jpa.repository.Query("SELECT mo FROM ManufacturingOrder mo WHERE mo.tenant.id = :tenantId AND mo.dueDate < :now AND mo.status NOT IN :excludeStatuses ORDER BY mo.dueDate ASC")
        java.util.List<ManufacturingOrder> findOverdueMos(
                        @org.springframework.data.repository.query.Param("tenantId") Long tenantId,
                        @org.springframework.data.repository.query.Param("now") java.time.OffsetDateTime now,
                        @org.springframework.data.repository.query.Param("excludeStatuses") java.util.List<com.example.multi_tanent.production.enums.ManufacturingOrderStatus> excludeStatuses);

        @org.springframework.data.jpa.repository.Query("SELECT mo FROM ManufacturingOrder mo WHERE mo.tenant.id = :tenantId AND mo.scheduleStart BETWEEN :now AND :future AND mo.status NOT IN :excludeStatuses ORDER BY mo.scheduleStart ASC")
        java.util.List<ManufacturingOrder> findUpcomingMos(
                        @org.springframework.data.repository.query.Param("tenantId") Long tenantId,
                        @org.springframework.data.repository.query.Param("now") java.time.OffsetDateTime now,
                        @org.springframework.data.repository.query.Param("future") java.time.OffsetDateTime future,
                        @org.springframework.data.repository.query.Param("excludeStatuses") java.util.List<com.example.multi_tanent.production.enums.ManufacturingOrderStatus> excludeStatuses);

        @org.springframework.data.jpa.repository.Query("SELECT CONCAT(mo.assignTo.firstName, ' ', mo.assignTo.lastName), COUNT(mo) FROM ManufacturingOrder mo WHERE mo.tenant.id = :tenantId AND mo.status = com.example.multi_tanent.production.enums.ManufacturingOrderStatus.IN_PROGRESS AND mo.assignTo IS NOT NULL GROUP BY mo.assignTo.id, mo.assignTo.firstName, mo.assignTo.lastName ORDER BY COUNT(mo) DESC")
        java.util.List<Object[]> countActiveMosByAssignee(
                        @org.springframework.data.repository.query.Param("tenantId") Long tenantId);
}
