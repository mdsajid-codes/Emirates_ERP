package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.WareProducts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Repository
public interface WareProductsRepository extends JpaRepository<WareProducts, Long> {
    List<WareProducts> findByEnterpriseId(Long tenantId);

    Page<WareProducts> findByEnterpriseId(Long tenantId, Pageable pageable);

    Optional<WareProducts> findByIdAndEnterpriseId(Long id, Long tenantId);

    Optional<WareProducts> findByBarcodeAndEnterpriseId(String barcode, Long tenantId);

    boolean existsBySkuAndEnterpriseId(String sku, Long tenantId);

    // --- Product Unification Queries ---
    Optional<WareProducts> findByRawMaterialIdAndWarehouseIdAndEnterpriseId(Long rawMaterialId, Long warehouseId, Long tenantId);
    
    Optional<WareProducts> findByCrmProductIdAndWarehouseIdAndEnterpriseId(Long crmProductId, Long warehouseId, Long tenantId);
    
    Optional<WareProducts> findByFinishedGoodIdAndWarehouseIdAndEnterpriseId(Long finishedGoodId, Long warehouseId, Long tenantId);
    
    Optional<WareProducts> findBySemifinishedIdAndWarehouseIdAndEnterpriseId(Long semifinishedId, Long warehouseId, Long tenantId);
    
    List<WareProducts> findAllByBarcodeAndEnterpriseId(String barcode, Long tenantId);

    // --- Stock Alert Queries ---
    
    // Low stock: products where sum(quantity in stock) is strictly less than minStockLevel
    @Query("SELECT p FROM WareProducts p WHERE p.enterprise.id = :tenantId AND p.minStockLevel IS NOT NULL " +
           "AND p.minStockLevel > (SELECT COALESCE(SUM(CASE WHEN i.type IN ('INBOUND_RECEIPT', 'TRANSFER_RECEIVE', 'ADJUSTMENT_IN') THEN i.quantity " +
           "WHEN i.type IN ('DISPATCH', 'TRANSFER_DISPATCH', 'ADJUSTMENT_OUT', 'PRODUCTION_ISSUE', 'SCRAP') THEN -i.quantity ELSE 0 END), 0) " +
           "FROM InventoryImprovement i WHERE i.product.id = p.id AND i.status = 'AVAILABLE')")
    List<WareProducts> findLowStockProducts(@Param("tenantId") Long tenantId);

    // Overstock: products where sum(quantity in stock) is strictly greater than maxStockLevel
    @Query("SELECT p FROM WareProducts p WHERE p.enterprise.id = :tenantId AND p.maxStockLevel IS NOT NULL " +
           "AND p.maxStockLevel < (SELECT COALESCE(SUM(CASE WHEN i.type IN ('INBOUND_RECEIPT', 'TRANSFER_RECEIVE', 'ADJUSTMENT_IN') THEN i.quantity " +
           "WHEN i.type IN ('DISPATCH', 'TRANSFER_DISPATCH', 'ADJUSTMENT_OUT', 'PRODUCTION_ISSUE', 'SCRAP') THEN -i.quantity ELSE 0 END), 0) " +
           "FROM InventoryImprovement i WHERE i.product.id = p.id AND i.status = 'AVAILABLE')")
    List<WareProducts> findOverstockProducts(@Param("tenantId") Long tenantId);
}
