package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.DispatchJob;
import com.example.multi_tanent.fleet.enums.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DispatchJobRepository extends JpaRepository<DispatchJob, Long> {
    
    Page<DispatchJob> findByTenantId(Long tenantId, Pageable pageable);
    
    Page<DispatchJob> findByTenantIdAndDeliveryStatus(Long tenantId, DeliveryStatus status, Pageable pageable);
    
    @Query("SELECT d FROM DispatchJob d JOIN FETCH d.customer WHERE d.id = :id AND d.tenant.id = :tenantId")
    Optional<DispatchJob> findByIdAndTenantId(Long id, Long tenantId);

    Page<DispatchJob> findByTenantIdAndLinkedTripId(Long tenantId, Long tripId, Pageable pageable);
    
    @Query("SELECT MAX(d.jobNo) FROM DispatchJob d WHERE d.tenant.id = :tenantId")
    String findMaxJobNoByTenantId(Long tenantId);

    @Query("""
        SELECT d FROM DispatchJob d
        WHERE d.tenant.id = :tenantId
        AND (:status IS NULL OR d.deliveryStatus = :status)
        AND (:query IS NULL 
             OR LOWER(d.jobNo) LIKE :query 
             OR LOWER(d.customer.companyName) LIKE :query 
             OR LOWER(d.pickupLocation) LIKE :query 
             OR LOWER(d.dropLocation) LIKE :query)
        ORDER BY d.createdAt DESC
    """)
    Page<DispatchJob> findAllFiltered(
        @Param("tenantId") Long tenantId,
        @Param("status") DeliveryStatus status,
        @Param("query") String query,
        Pageable pageable);
}
