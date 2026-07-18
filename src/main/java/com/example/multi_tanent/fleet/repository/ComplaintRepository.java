package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.Complaint;
import com.example.multi_tanent.fleet.enums.ComplaintStatus;
import com.example.multi_tanent.fleet.enums.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    @Query(value = "SELECT c FROM Complaint c WHERE c.tenant.id = :tenantId",
           countQuery = "SELECT COUNT(c) FROM Complaint c WHERE c.tenant.id = :tenantId")
    Page<Complaint> findByTenantIdWithDetails(@Param("tenantId") Long tenantId, Pageable pageable);

    @Query(value = "SELECT c FROM Complaint c WHERE c.tenant.id = :tenantId " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:riskLevel IS NULL OR c.riskLevel = :riskLevel) " +
           "AND (:query IS NULL " +
           "     OR LOWER(c.complaintCode) LIKE :query " +
           "     OR LOWER(c.category) LIKE :query " +
           "     OR LOWER(c.type) LIKE :query " +
           "     OR LOWER(c.description) LIKE :query)",
           countQuery = "SELECT COUNT(c) FROM Complaint c WHERE c.tenant.id = :tenantId " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:riskLevel IS NULL OR c.riskLevel = :riskLevel) " +
           "AND (:query IS NULL " +
           "     OR LOWER(c.complaintCode) LIKE :query " +
           "     OR LOWER(c.category) LIKE :query " +
           "     OR LOWER(c.type) LIKE :query " +
           "     OR LOWER(c.description) LIKE :query)")
    Page<Complaint> findByTenantIdAndFiltersWithDetails(
            @Param("tenantId") Long tenantId, 
            @Param("status") ComplaintStatus status, 
            @Param("riskLevel") RiskLevel riskLevel, 
            @Param("query") String query,
            Pageable pageable);

    @Query("SELECT c FROM Complaint c " +
           "LEFT JOIN FETCH c.trip " +
           "LEFT JOIN FETCH c.vehicle " +
           "LEFT JOIN FETCH c.driver " +
           "LEFT JOIN FETCH c.assignedTo " +
           "WHERE c.id = :id")
    Optional<Complaint> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.tenant.id = :tenantId AND c.driver.id = :driverId AND " +
           "FUNCTION('DATE_FORMAT', c.reportedDate, '%Y-%m') = :yearMonth")
    long countByTenantIdAndDriverIdAndMonth(@Param("tenantId") Long tenantId, @Param("driverId") Long driverId, @Param("yearMonth") String yearMonth);

    long countByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.tenant.id = :tenantId AND c.status != :status")
    long countByTenantIdAndStatusNot(@Param("tenantId") Long tenantId, @Param("status") com.example.multi_tanent.fleet.enums.ComplaintStatus status);
}
