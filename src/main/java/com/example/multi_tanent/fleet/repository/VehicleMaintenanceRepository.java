package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.VehicleMaintenance;
import com.example.multi_tanent.fleet.enums.MaintenanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

@Repository
public interface VehicleMaintenanceRepository extends JpaRepository<VehicleMaintenance, Long> {
    
    @Query("SELECT m FROM VehicleMaintenance m LEFT JOIN FETCH m.vehicle WHERE m.id = :id")
    Optional<VehicleMaintenance> findByIdWithVehicle(@Param("id") Long id);
    @Query("SELECT m FROM VehicleMaintenance m LEFT JOIN FETCH m.vehicle WHERE m.tenant.id = :tenantId")
    Page<VehicleMaintenance> findByTenantIdWithVehicle(@Param("tenantId") Long tenantId, Pageable pageable);

    @Query("SELECT m FROM VehicleMaintenance m LEFT JOIN FETCH m.vehicle WHERE m.tenant.id = :tenantId AND m.status = :status")
    Page<VehicleMaintenance> findByTenantIdAndStatusWithVehicle(@Param("tenantId") Long tenantId, @Param("status") MaintenanceStatus status, Pageable pageable);

    @Query("SELECT m FROM VehicleMaintenance m JOIN m.trip t LEFT JOIN FETCH m.vehicle WHERE m.tenant.id = :tenantId AND t.id = :tripId")
    Page<VehicleMaintenance> findByTenantIdAndTripIdWithVehicle(@Param("tenantId") Long tenantId, @Param("tripId") Long tripId, Pageable pageable);

    @Query("SELECT m FROM VehicleMaintenance m LEFT JOIN FETCH m.vehicle WHERE m.tenant.id = :tenantId AND m.vehicle.id = :vehicleId")
    Page<VehicleMaintenance> findByTenantIdAndVehicleIdWithVehicle(@Param("tenantId") Long tenantId, @Param("vehicleId") Long vehicleId, Pageable pageable);

    List<VehicleMaintenance> findByVehicleIdAndTenantId(Long vehicleId, Long tenantId);
    
    @Query("SELECT m FROM VehicleMaintenance m LEFT JOIN FETCH m.vehicle WHERE m.tenant.id = :tenantId AND m.scheduledDate <= :date AND m.status NOT IN (com.example.multi_tanent.fleet.enums.MaintenanceStatus.COMPLETED, com.example.multi_tanent.fleet.enums.MaintenanceStatus.CANCELLED)")
    List<VehicleMaintenance> findOverdueMaintenanceByTenant(@Param("tenantId") Long tenantId, @Param("date") java.time.LocalDate date);

    @Query("SELECT COUNT(m) FROM VehicleMaintenance m WHERE m.tenant.id = :tenantId AND m.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") Long tenantId, @Param("status") MaintenanceStatus status);

    @Query("""
        SELECT m FROM VehicleMaintenance m 
        LEFT JOIN FETCH m.vehicle 
        WHERE m.tenant.id = :tenantId
        AND (:status IS NULL OR m.status = :status)
        AND (:query IS NULL 
             OR LOWER(m.vehicle.plateNumber) LIKE :query 
             OR LOWER(m.garage) LIKE :query
             OR LOWER(m.maintenanceType) LIKE :query
             OR LOWER(m.serviceCategory) LIKE :query)
        ORDER BY m.scheduledDate DESC, m.requestedDate DESC
    """)
    Page<VehicleMaintenance> findAllFiltered(
        @Param("tenantId") Long tenantId,
        @Param("status") MaintenanceStatus status,
        @Param("query") String query,
        Pageable pageable);
}
