package com.example.multi_tanent.hanger.repository;

import com.example.multi_tanent.hanger.entity.HngCoilStock;
import com.example.multi_tanent.hanger.enums.CoilInspectionStatus;
import com.example.multi_tanent.hanger.enums.CoilStatus;
import com.example.multi_tanent.hanger.enums.WireMaterialType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface HngCoilStockRepository extends JpaRepository<HngCoilStock, Long> {

        long countByTenant(com.example.multi_tanent.spersusers.enitity.Tenant tenant);

        List<HngCoilStock> findByTenantTenantIdOrderByCreatedAtDesc(String tenantId);

        Optional<HngCoilStock> findByCoilNoAndTenantTenantId(String coilNo, String tenantId);

        List<HngCoilStock> findByTenantTenantIdAndStatus(String tenantId, CoilStatus status);

        List<HngCoilStock> findByTenantTenantIdAndInspectionStatus(String tenantId,
                        CoilInspectionStatus inspectionStatus);

        /**
         * Find available coils matching the required wire gauge — for Material Issue
         * suggestion
         */
        @Query("SELECT c FROM HngCoilStock c " +
                        "WHERE c.tenant.tenantId = :tenantId " +
                        "AND c.wireGaugeMm = :gaugeRequired " +
                        "AND c.inspectionStatus = 'APPROVED' " +
                        "AND c.status IN ('AVAILABLE', 'PARTIAL') " +
                        "AND c.remainingWeightKg >= :minWeightRequired " +
                        "ORDER BY c.receivedDate ASC")
        List<HngCoilStock> findEligibleCoilsForIssue(@Param("tenantId") String tenantId,
                        @Param("gaugeRequired") BigDecimal gaugeRequired,
                        @Param("minWeightRequired") BigDecimal minWeightRequired);

        boolean existsByCoilNo(String coilNo);

        /** Total remaining weight currently in stock */
        @Query("SELECT COALESCE(SUM(c.remainingWeightKg), 0) FROM HngCoilStock c " +
                        "WHERE c.tenant.tenantId = :tenantId AND c.status IN ('AVAILABLE', 'PARTIAL')")
        BigDecimal sumRemainingWeightByTenantId(@Param("tenantId") String tenantId);

        /** All coils from a specific GRN item */
        List<HngCoilStock> findByGrnItemIdAndTenantTenantId(Long grnItemId, String tenantId);

        /** Coils that have been issued to a specific Manufacturing Order */
        @Query("SELECT DISTINCT mid.coilRef FROM MaterialIssueDetail mid " +
                        "WHERE mid.materialIssue.materialRequisition.manufacturingOrder.id = :moId " +
                        "AND mid.materialIssue.tenant.tenantId = :tenantId " +
                        "AND mid.coilRef IS NOT NULL")
        List<HngCoilStock> findCoilsIssuedToMo(@Param("moId") Long moId, @Param("tenantId") String tenantId);
}
