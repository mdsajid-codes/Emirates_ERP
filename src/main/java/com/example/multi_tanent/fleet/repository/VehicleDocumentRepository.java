package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.VehicleDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleDocumentRepository extends JpaRepository<VehicleDocument, Long> {
    List<VehicleDocument> findByVehicleIdAndTenantId(Long vehicleId, Long tenantId);
}
