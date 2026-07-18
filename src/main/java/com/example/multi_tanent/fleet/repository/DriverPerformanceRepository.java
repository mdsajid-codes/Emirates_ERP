package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.DriverPerformance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverPerformanceRepository extends JpaRepository<DriverPerformance, Long> {

    @Query("SELECT dp FROM DriverPerformance dp " +
           "JOIN FETCH dp.driver d " +
           "WHERE dp.tenant.id = :tenantId")
    Page<DriverPerformance> findByTenantIdWithDetails(@Param("tenantId") Long tenantId, Pageable pageable);

    @Query(value = "SELECT dp FROM DriverPerformance dp " +
           "JOIN FETCH dp.driver d " +
           "WHERE dp.tenant.id = :tenantId " +
           "AND (:driverId IS NULL OR d.id = :driverId) " +
           "AND (:period IS NULL OR dp.evaluationPeriod = :period) " +
           "AND (:query IS NULL " +
           "     OR LOWER(d.name) LIKE :query " +
           "     OR LOWER(dp.remarks) LIKE :query)",
           countQuery = "SELECT COUNT(dp) FROM DriverPerformance dp " +
           "WHERE dp.tenant.id = :tenantId " +
           "AND (:driverId IS NULL OR dp.driver.id = :driverId) " +
           "AND (:period IS NULL OR dp.evaluationPeriod = :period) " +
           "AND (:query IS NULL " +
           "     OR LOWER(dp.driver.name) LIKE :query " +
           "     OR LOWER(dp.remarks) LIKE :query)")
    Page<DriverPerformance> findByFiltersWithDetails(
            @Param("tenantId") Long tenantId, 
            @Param("driverId") Long driverId, 
            @Param("period") String period, 
            @Param("query") String query,
            Pageable pageable);

    @Query("SELECT dp FROM DriverPerformance dp " +
           "JOIN FETCH dp.driver d " +
           "WHERE dp.id = :id")
    Optional<DriverPerformance> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT dp FROM DriverPerformance dp " +
           "WHERE dp.tenant.id = :tenantId " +
           "AND dp.driver.id = :driverId " +
           "AND dp.evaluationPeriod = :period")
    Optional<DriverPerformance> findByUniqueConstraint(
            @Param("tenantId") Long tenantId, 
            @Param("driverId") Long driverId, 
            @Param("period") String period);
}
