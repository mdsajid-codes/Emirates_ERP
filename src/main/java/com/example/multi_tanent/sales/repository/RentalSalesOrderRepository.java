package com.example.multi_tanent.sales.repository;

import com.example.multi_tanent.sales.entity.RentalSalesOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RentalSalesOrderRepository extends JpaRepository<RentalSalesOrder, Long> {
    Optional<RentalSalesOrder> findByIdAndTenantId(Long id, Long tenantId);

    Page<RentalSalesOrder> findByTenantId(Long tenantId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM RentalSalesOrder r WHERE r.tenant.id = :tenantId AND "
            +
            "(:search IS NULL OR :search = '' OR lower(r.orderNumber) LIKE lower(concat('%', :search, '%')) OR lower(r.reference) LIKE lower(concat('%', :search, '%')) OR lower(r.customer.companyName) LIKE lower(concat('%', :search, '%'))) AND "
            +
            "(:fromDate IS NULL OR r.orderDate >= :fromDate) AND " +
            "(:toDate IS NULL OR r.orderDate <= :toDate) AND " +
            "(:salespersonId IS NULL OR r.salesperson.id = :salespersonId)")
    Page<RentalSalesOrder> searchRentalSalesOrders(
            @org.springframework.data.repository.query.Param("tenantId") Long tenantId,
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("fromDate") java.time.LocalDate fromDate,
            @org.springframework.data.repository.query.Param("toDate") java.time.LocalDate toDate,
            @org.springframework.data.repository.query.Param("salespersonId") Long salespersonId,
            Pageable pageable);
}
