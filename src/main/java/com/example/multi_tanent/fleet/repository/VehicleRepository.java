package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByIdAndEnterpriseId(Long id, Long enterpriseId);
    Page<Vehicle> findByEnterpriseIdAndIsActiveTrue(Long enterpriseId, Pageable pageable);
    Optional<Vehicle> findByPlateNumberAndEnterpriseId(String plateNumber, Long enterpriseId);
    Optional<Vehicle> findByEngineNumberAndEnterpriseId(String engineNumber, Long enterpriseId);
    Optional<Vehicle> findByVinNumberAndEnterpriseId(String vinNumber, Long enterpriseId);
    java.util.List<Vehicle> findAllByEnterprise(com.example.multi_tanent.spersusers.enitity.Tenant enterprise);

    long countByEnterpriseIdAndIsActiveTrue(Long enterpriseId);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM Vehicle v WHERE v.enterprise.id = :enterpriseId AND v.isActive = true AND " +
            "(LOWER(v.plateNumber) LIKE :query OR LOWER(v.make) LIKE :query OR LOWER(v.model) LIKE :query)")
    Page<Vehicle> searchVehicles(
            @org.springframework.data.repository.query.Param("enterpriseId") Long enterpriseId, 
            @org.springframework.data.repository.query.Param("query") String query, 
            Pageable pageable);
}
