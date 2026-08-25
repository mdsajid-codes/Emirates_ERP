package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.fleet.entity.TripInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface TripInvoiceRepository extends JpaRepository<TripInvoice, Long> {
    List<TripInvoice> findAllByTenantOrderByCreatedAtDesc(Tenant tenant);
    @Query("SELECT i FROM TripInvoice i JOIN FETCH i.tenant JOIN FETCH i.customer LEFT JOIN FETCH i.trips WHERE i.id = :id")
    Optional<TripInvoice> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT COUNT(i) FROM TripInvoice i WHERE i.tenant = :tenant")
    Long countByTenant(@Param("tenant") Tenant tenant);

    @Query("SELECT i FROM TripInvoice i WHERE i.tenant.id = :tenantId " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:customerId IS NULL OR i.customer.id = :customerId) " +
           "AND (:startDate IS NULL OR i.invoiceDate >= :startDate) " +
           "AND (:endDate IS NULL OR i.invoiceDate <= :endDate)")
    org.springframework.data.domain.Page<TripInvoice> findFiltered(
            @Param("tenantId") Long tenantId,
            @Param("status") com.example.multi_tanent.fleet.enums.InvoiceStatus status,
            @Param("customerId") Long customerId,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate,
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT SUM(i.grandTotal) FROM TripInvoice i WHERE i.tenant.id = :tenantId AND i.invoiceDate >= :startDate AND i.invoiceDate <= :endDate")
    java.math.BigDecimal sumTotalAmountByTenantAndDateRange(@Param("tenantId") Long tenantId, @Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);
}
