package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.warehouse.dto.StockAlertDto;
import com.example.multi_tanent.warehouse.entity.InventoryImprovement;
import com.example.multi_tanent.warehouse.entity.WareProductBatch;
import com.example.multi_tanent.warehouse.entity.WareProducts;
import com.example.multi_tanent.warehouse.repository.InventoryImprovementRepository;
import com.example.multi_tanent.warehouse.repository.WareProductBatchRepository;
import com.example.multi_tanent.warehouse.repository.WareProductsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockAlertService {

    private final WareProductsRepository productsRepository;
    private final WareProductBatchRepository batchRepository;
    private final InventoryImprovementRepository inventoryRepository;

    private static final List<String> INWARD_TYPES = List.of(
            "INBOUND_RECEIPT", "TRANSFER_RECEIVE", "ADJUSTMENT_IN", "PUT_AWAY", "PRODUCTION_RECEIPT", "QC_ACCEPT", "INWARD");

    private static final List<String> OUTWARD_TYPES = List.of(
            "DISPATCH", "TRANSFER_DISPATCH", "ADJUSTMENT_OUT", "PRODUCTION_ISSUE", "SCRAP", "OUTWARD");

    @Transactional(readOnly = true)
    public StockAlertDto getStockAlerts(Long tenantId, int expiryDaysThreshold) {
        
        // 1. Fetch condition matches
        List<WareProducts> lowStock = productsRepository.findLowStockProducts(tenantId);
        List<WareProducts> overStock = productsRepository.findOverstockProducts(tenantId);
        
        LocalDate thresholdDate = LocalDate.now().plusDays(expiryDaysThreshold);
        List<WareProductBatch> expiring = batchRepository.findByProduct_Enterprise_IdAndExpiryDateBefore(tenantId, thresholdDate);

        // 2. Fetch all movements to calculate precise current quantities for the dto
        List<InventoryImprovement> movements = inventoryRepository.findByEnterpriseId(tenantId);
        
        Map<Long, Double> totalProductStocks = movements.stream()
                .filter(m -> m.getProduct() != null)
                .collect(Collectors.groupingBy(
                        m -> m.getProduct().getId(),
                        Collectors.summingDouble(this::calculateMovementDelta)
                ));

        // 3. Map Low Stock
        List<StockAlertDto.LowStockItem> lowItems = lowStock.stream().map(p -> {
            Double qty = totalProductStocks.getOrDefault(p.getId(), 0.0);
            return StockAlertDto.LowStockItem.builder()
                    .productId(p.getId())
                    .productName(p.getName())
                    .sku(p.getSku())
                    .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : "N/A")
                    .currentStock(BigDecimal.valueOf(qty))
                    .minStockLevel(p.getMinStockLevel())
                    .reorderPoint(p.getReorderPoint())
                    .build();
        }).collect(Collectors.toList());

        // 4. Map Overstock
        List<StockAlertDto.OverStockItem> overItems = overStock.stream().map(p -> {
            Double qty = totalProductStocks.getOrDefault(p.getId(), 0.0);
            return StockAlertDto.OverStockItem.builder()
                    .productId(p.getId())
                    .productName(p.getName())
                    .sku(p.getSku())
                    .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : "N/A")
                    .currentStock(BigDecimal.valueOf(qty))
                    .maxStockLevel(p.getMaxStockLevel())
                    .build();
        }).collect(Collectors.toList());

        // 5. Map Expiring Batches
        List<StockAlertDto.ExpiringBatch> expiringItems = expiring.stream().map(b -> {
            long days = b.getExpiryDate() != null ? ChronoUnit.DAYS.between(LocalDate.now(), b.getExpiryDate()) : 0;
            return StockAlertDto.ExpiringBatch.builder()
                    .batchId(b.getId())
                    .batchNumber(b.getBatchNumber())
                    .productId(b.getProduct() != null ? b.getProduct().getId() : null)
                    .productName(b.getProduct() != null ? b.getProduct().getName() : "N/A")
                    .expiryDate(b.getExpiryDate())
                    .daysUntilExpiry(days)
                    .build();
        }).collect(Collectors.toList());

        return StockAlertDto.builder()
                .lowStockItems(lowItems)
                .overStockItems(overItems)
                .expiringBatches(expiringItems)
                .build();
    }

    private double calculateMovementDelta(InventoryImprovement m) {
        String type = m.getType().name();
        if (INWARD_TYPES.contains(type)) {
            return m.getQuantity() != null ? m.getQuantity() : 0.0;
        } else if (OUTWARD_TYPES.contains(type)) {
            return m.getQuantity() != null ? -m.getQuantity() : 0.0;
        }
        return 0.0;
    }
}
