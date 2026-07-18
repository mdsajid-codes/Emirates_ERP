package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.Bin;
import com.example.multi_tanent.warehouse.enums.BinType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BinRepository extends JpaRepository<Bin, Long> {
    List<Bin> findByWarehouseEnterpriseId(Long tenantId);

    Page<Bin> findByWarehouseEnterpriseId(Long tenantId, Pageable pageable);

    Optional<Bin> findByIdAndWarehouseEnterpriseId(Long id, Long tenantId);

    Optional<Bin> findByBinCodeAndWarehouseEnterpriseId(String binCode, Long tenantId);

    boolean existsByBinCodeAndWarehouseIdAndWarehouseEnterpriseId(String binCode, Long warehouseId, Long tenantId);

    List<Bin> findByIsActiveAndWarehouseEnterpriseId(Boolean isActive, Long tenantId);

    List<Bin> findByBinTypeAndWarehouseEnterpriseId(BinType binType, Long tenantId);

    Optional<Bin> findByBarcodeTagAndWarehouseEnterpriseId(String barcodeTag, Long tenantId);
}
