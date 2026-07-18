package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.enums.DriverStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByIdAndEnterpriseId(Long id, Long enterpriseId);
    Page<Driver> findByEnterpriseIdAndIsActiveTrue(Long enterpriseId, Pageable pageable);
    Page<Driver> findByEnterpriseIdAndStatusAndIsActiveTrue(Long enterpriseId, DriverStatus status, Pageable pageable);
    Optional<Driver> findByEmployeeCodeAndEnterpriseId(String employeeCode, Long enterpriseId);
    Optional<Driver> findByLicenseNumberAndEnterpriseId(String licenseNumber, Long enterpriseId);
    Optional<Driver> findByEmiratesIdAndEnterpriseId(String emiratesId, Long enterpriseId);
    java.util.List<Driver> findAllByEnterprise(com.example.multi_tanent.spersusers.enitity.Tenant enterprise);

    long countByEnterpriseIdAndIsActiveTrue(Long enterpriseId);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Driver d WHERE d.enterprise.id = :enterpriseId AND d.isActive = true AND " +
            "(:status IS NULL OR d.status = :status) AND " +
            "(LOWER(d.name) LIKE :query OR LOWER(d.employeeCode) LIKE :query OR LOWER(d.phone) LIKE :query)")
    Page<Driver> searchDrivers(
            @org.springframework.data.repository.query.Param("enterpriseId") Long enterpriseId,
            @org.springframework.data.repository.query.Param("status") DriverStatus status,
            @org.springframework.data.repository.query.Param("query") String query,
            Pageable pageable);
}
