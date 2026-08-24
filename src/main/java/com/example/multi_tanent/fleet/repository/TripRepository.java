package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.fleet.entity.Trip;
import com.example.multi_tanent.fleet.entity.TripCustomer;
import com.example.multi_tanent.fleet.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TripRepository extends JpaRepository<Trip, Long> {
    Optional<Trip> findByIdAndTenantId(Long id, Long tenantId);
    Optional<Trip> findByTenantAndId(Tenant tenant, Long id);
    @Query("""
        SELECT t FROM Trip t
        WHERE t.tenant = :tenant
        AND (:status IS NULL OR t.tripStatus = :status)
        AND (:driverId IS NULL OR t.driver.id = :driverId)
        AND (:customerId IS NULL OR t.customer.id = :customerId)
        AND (:fromDate IS NULL OR t.tripDate >= :fromDate)
        AND (:toDate IS NULL OR t.tripDate <= :toDate)
        AND (:query IS NULL OR CAST(t.tripNo AS string) LIKE :query OR LOWER(t.customer.companyName) LIKE :query OR LOWER(t.driver.name) LIKE :query)
        ORDER BY t.tripDate DESC
    """)
    Page<Trip> findAllFiltered(
        @Param("tenant") Tenant tenant,
        @Param("status") TripStatus status,
        @Param("driverId") Long driverId,
        @Param("customerId") Long customerId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("query") String query,
        Pageable pageable);
    List<Trip> findAllByTenantOrderByTripDateDesc(Tenant tenant);
    List<Trip> findAllByTenantAndTripMonth(Tenant tenant, String month);
    List<Trip> findAllByTenantAndDriver(Tenant tenant, Driver driver);
    List<Trip> findAllByTenantAndCustomer(Tenant tenant, TripCustomer customer);
    List<Trip> findAllByTenantAndTripStatus(Tenant tenant, TripStatus status);
    List<Trip> findAllByTenantAndCustomerAndTripStatusAndInvoiceIsNull(
        Tenant tenant, TripCustomer customer, TripStatus status);

    @Query("SELECT COALESCE(MAX(t.tripNo), 0) FROM Trip t WHERE t.tenant = :tenant")
    Integer findMaxTripNoByTenant(@Param("tenant") Tenant tenant);

    // Reports
    @Query("""
        SELECT t.driver.id, t.driver.name, COUNT(t), SUM(tc.amount), SUM(tc.driverCommission)
        FROM Trip t JOIN t.charges tc
        WHERE t.tenant = :tenant AND t.tripMonth = :month
        GROUP BY t.driver.id, t.driver.name
        """)
    List<Object[]> getDriverReportByMonth(@Param("tenant") Tenant tenant, @Param("month") String month);

    @Query("""
        SELECT t.customer.id, t.customer.companyName, COUNT(t), SUM(tc.totalAmount)
        FROM Trip t JOIN t.charges tc
        WHERE t.tenant = :tenant AND t.tripMonth = :month
        GROUP BY t.customer.id, t.customer.companyName
        """)
    List<Object[]> getCustomerReportByMonth(@Param("tenant") Tenant tenant, @Param("month") String month);

    @Query("""
        SELECT va.vendor.id, va.vendor.companyName, COUNT(t), SUM(va.vendorAmount)
        FROM Trip t JOIN t.vendorAssignment va
        WHERE t.tenant = :tenant AND t.tripMonth = :month
        GROUP BY va.vendor.id, va.vendor.companyName
        """)
    List<Object[]> getVendorReportByMonth(@Param("tenant") Tenant tenant, @Param("month") String month);
    @Query("SELECT t FROM Trip t JOIN FETCH t.driver JOIN FETCH t.customer WHERE t.id IN :ids")
    List<Trip> findAllByIdInWithDriver(@Param("ids") List<Long> ids);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.tenant.id = :tenantId AND t.tripDate = :date")
    long countByTenantIdAndTripDate(@Param("tenantId") Long tenantId, @Param("date") java.time.LocalDate date);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.tenant.id = :tenantId AND t.tripDate BETWEEN :startDate AND :endDate")
    long countByTenantIdAndTripDateBetween(@Param("tenantId") Long tenantId, @Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);
}
