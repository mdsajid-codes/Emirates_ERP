package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.Shelf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShelfRepository extends JpaRepository<Shelf, Long> {
    List<Shelf> findByRackZoneWarehouseEnterpriseId(Long tenantId);

    Optional<Shelf> findByIdAndRackZoneWarehouseEnterpriseId(Long id, Long tenantId);

    List<Shelf> findByIsActiveAndRackZoneWarehouseEnterpriseId(Boolean isActive, Long tenantId);

    Optional<Shelf> findByBarcodeTagAndRackZoneWarehouseEnterpriseId(String barcodeTag, Long tenantId);
}
