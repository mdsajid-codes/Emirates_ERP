package com.example.multi_tanent.purchases.repository;

import com.example.multi_tanent.purchases.entity.PurPurchaseInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurPurchaseInvoiceRepository extends JpaRepository<PurPurchaseInvoice, Long> {
    Page<PurPurchaseInvoice> findByTenantId(Long tenantId, Pageable pageable);

    List<PurPurchaseInvoice> findByTenantId(Long tenantId);

    Optional<PurPurchaseInvoice> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT i FROM PurPurchaseInvoice i " +
            "WHERE i.supplier.id = :supplierId " +
            "AND i.tenant.id = :tenantId " +
            "AND i.netTotal > (SELECT COALESCE(SUM(pa.allocatedAmount), 0) " +
            "FROM PurPurchasePaymentAllocation pa WHERE pa.purchaseInvoice.id = i.id)")
    List<PurPurchaseInvoice> findUnpaidInvoices(@Param("supplierId") Long supplierId, @Param("tenantId") Long tenantId);

    Long countByTenantId(Long tenantId);

    @Query("SELECT SUM(i.netTotal) FROM PurPurchaseInvoice i WHERE i.tenant.id = :tenantId")
    java.math.BigDecimal sumNetTotalByTenantId(@Param("tenantId") Long tenantId);
}
