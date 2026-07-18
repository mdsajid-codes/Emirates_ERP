package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.Rack;
import com.example.multi_tanent.warehouse.enums.RackType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RackRepository extends JpaRepository<Rack, Long> {
    List<Rack> findByZoneWarehouseEnterpriseId(Long enterpriseId);

    Optional<Rack> findByIdAndZoneWarehouseEnterpriseId(Long id, Long enterpriseId);

    List<Rack> findByIsActiveAndZoneWarehouseEnterpriseId(Boolean isActive, Long enterpriseId);

    Optional<Rack> findByBarcodeTagAndZoneWarehouseEnterpriseId(String barcodeTag, Long enterpriseId);

    List<Rack> findByRackTypeAndZoneWarehouseEnterpriseId(RackType rackType, Long enterpriseId);
}
