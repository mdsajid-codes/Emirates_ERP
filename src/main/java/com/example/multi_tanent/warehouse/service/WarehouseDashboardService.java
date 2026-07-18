package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.purchases.repository.PurGrnRepository;
import com.example.multi_tanent.warehouse.dto.WarehouseDashboardDto;
import com.example.multi_tanent.warehouse.entity.InventoryImprovement;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.entity.WareProducts;
import com.example.multi_tanent.warehouse.enums.TransferStatus;
import com.example.multi_tanent.warehouse.repository.InventoryImprovementRepository;
import com.example.multi_tanent.warehouse.repository.TransferOrderRepository;
import com.example.multi_tanent.warehouse.repository.WareHouseRepository;
import com.example.multi_tanent.warehouse.repository.WareProductsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseDashboardService {

    private final WareProductsRepository productsRepository;
    private final InventoryImprovementRepository inventoryRepository;
    private final WareHouseRepository warehouseRepository;
    private final PurGrnRepository grnRepository;
    private final TransferOrderRepository transferRepository;

    private static final List<String> INWARD_TYPES = List.of(
            "INBOUND_RECEIPT", "TRANSFER_RECEIVE", "ADJUSTMENT_IN", "PUT_AWAY", "PRODUCTION_RECEIPT", "QC_ACCEPT", "INWARD");

    private static final List<String> OUTWARD_TYPES = List.of(
            "DISPATCH", "TRANSFER_DISPATCH", "ADJUSTMENT_OUT", "PRODUCTION_ISSUE", "SCRAP", "OUTWARD");

    @Transactional(readOnly = true)
    public WarehouseDashboardDto getDashboardStats(Long tenantId) {
        // 1. Load context
        List<WareHouse> warehouses = warehouseRepository.findByEnterpriseId(tenantId);
        List<InventoryImprovement> movements = inventoryRepository.findByEnterpriseId(tenantId);
        
        // Products lookup map to prevent DB n+1
        Map<Long, WareProducts> productMap = productsRepository.findByEnterpriseId(tenantId).stream()
                .collect(Collectors.toMap(WareProducts::getId, Function.identity()));

        // 2. Group movements by warehouse and product to calculate stocks
        Map<Long, Map<Long, Double>> warehouseProductStocks = movements.stream()
                .filter(m -> m.getWarehouse() != null)
                .collect(Collectors.groupingBy(
                        m -> m.getWarehouse().getId(),
                        Collectors.groupingBy(
                                m -> m.getProduct() != null ? m.getProduct().getId() : -1L,
                                Collectors.summingDouble(this::calculateMovementDelta)
                        )
                ));

        // 3. Aggregate Stock Summaries
        List<WarehouseDashboardDto.WarehouseStockSummary> summaries = warehouses.stream().map(wh -> {
            Map<Long, Double> stocks = warehouseProductStocks.getOrDefault(wh.getId(), Collections.emptyMap());
            BigDecimal totalValue = BigDecimal.ZERO;
            long productCount = 0;

            for (Map.Entry<Long, Double> entry : stocks.entrySet()) {
                Double qty = entry.getValue();
                if (qty > 0) {
                    productCount++;
                    WareProducts p = productMap.get(entry.getKey());
                    if (p != null && p.getPurchasePrice() != null) {
                        totalValue = totalValue.add(p.getPurchasePrice().multiply(BigDecimal.valueOf(qty)));
                    }
                }
            }
            return WarehouseDashboardDto.WarehouseStockSummary.builder()
                    .warehouseId(wh.getId())
                    .warehouseName(wh.getName())
                    .totalProducts(productCount)
                    .totalStockValue(totalValue)
                    .build();
        }).collect(Collectors.toList());

        // 4. Recent Movements
        List<WarehouseDashboardDto.RecentMovement> recentMovements = movements.stream()
                .sorted(Comparator.comparing(InventoryImprovement::getMovementAt).reversed())
                .limit(10)
                .map(m -> WarehouseDashboardDto.RecentMovement.builder()
                        .id(m.getId())
                        .movementNo(m.getMovementNo())
                        .type(m.getType().name())
                        .productName(m.getProduct() != null ? m.getProduct().getName() : "N/A")
                        .quantity(m.getQuantity())
                        .warehouseName(m.getWarehouse() != null ? m.getWarehouse().getName() : "N/A")
                        .movementAt(m.getMovementAt())
                        .build())
                .collect(Collectors.toList());

        // 5. Pending queues
        long pendingGrns = grnRepository.countByPurchaseOrder_Tenant_Id(tenantId);
        long pendingTransfers = transferRepository.countByStatusAndEnterpriseId(TransferStatus.IN_TRANSIT, tenantId);

        // 6. Top Products by Value (Aggregate sums across all warehouses)
        Map<Long, Double> totalProductStocks = movements.stream()
                .filter(m -> m.getProduct() != null)
                .collect(Collectors.groupingBy(
                        m -> m.getProduct().getId(),
                        Collectors.summingDouble(this::calculateMovementDelta)
                ));

        List<WarehouseDashboardDto.TopProductByValue> topProducts = totalProductStocks.entrySet().stream()
                .map(e -> {
                    WareProducts p = productMap.get(e.getKey());
                    if (p == null) return null;
                    BigDecimal val = p.getPurchasePrice() != null 
                        ? p.getPurchasePrice().multiply(BigDecimal.valueOf(e.getValue())) 
                        : BigDecimal.ZERO;
                    return WarehouseDashboardDto.TopProductByValue.builder()
                            .productId(p.getId())
                            .productName(p.getName())
                            .sku(p.getSku())
                            .stockValue(val)
                            .build();
                })
                .filter(Objects::nonNull)
                .sorted((a, b) -> b.getStockValue().compareTo(a.getStockValue()))
                .limit(5)
                .collect(Collectors.toList());

        // 7. Movement Breakdown
        Map<String, Long> breakdownRaw = movements.stream()
                .collect(Collectors.groupingBy(m -> m.getType().name(), Collectors.counting()));
        
        List<WarehouseDashboardDto.MovementBreakdown> breakdown = breakdownRaw.entrySet().stream()
                .map(e -> WarehouseDashboardDto.MovementBreakdown.builder()
                        .type(e.getKey())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // 8. Alerts
        List<WarehouseDashboardDto.AlertItem> alerts = new ArrayList<>();
        
        // Low Stock triggers
        for (WareProducts p : productMap.values()) {
            Double qty = totalProductStocks.getOrDefault(p.getId(), 0.0);
            if (p.getMinStockLevel() != null && BigDecimal.valueOf(qty).compareTo(p.getMinStockLevel()) < 0) {
                alerts.add(WarehouseDashboardDto.AlertItem.builder()
                        .type("LOW_STOCK")
                        .message(p.getName() + " (" + p.getSku() + ") is low on stock: " + qty)
                        .severity("HIGH")
                        .build());
            }
        }

        return WarehouseDashboardDto.builder()
                .stockSummaries(summaries)
                .recentMovements(recentMovements)
                .pendingGrnCount(pendingGrns)
                .pendingTransferCount(pendingTransfers)
                .topProductsByValue(topProducts)
                .movementBreakdown(breakdown)
                .alerts(alerts)
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
