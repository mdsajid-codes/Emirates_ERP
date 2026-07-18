package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.DriverDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverDocumentRepository extends JpaRepository<DriverDocument, Long> {

    @Query("SELECT d FROM DriverDocument d WHERE d.tenant.id = :tenantId AND d.driver.id = :driverId ORDER BY d.uploadedAt DESC")
    List<DriverDocument> findByTenantIdAndDriverId(@Param("tenantId") Long tenantId, @Param("driverId") Long driverId);
}
