package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.warehouse.dto.CostingDto;
import com.example.multi_tanent.warehouse.entity.InventoryImprovement;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.entity.WareProducts;
import com.example.multi_tanent.warehouse.enums.PickingStrategy;
import com.example.multi_tanent.warehouse.repository.InventoryImprovementRepository;
import com.example.multi_tanent.warehouse.repository.WareHouseRepository;
import com.example.multi_tanent.warehouse.repository.WareProductsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CostingService {

    private final InventoryImprovementRepository inventoryRepository;
    private final WareProductsRepository productsRepository;
    private final WareHouseRepository warehouseRepository;

    private static final List<String> INWARD_TYPES = List.of(
            "INBOUND_RECEIPT", "TRANSFER_RECEIVE", "ADJUSTMENT_IN", "PUT_AWAY", "PRODUCTION_RECEIPT", "QC_ACCEPT", "INWARD");

    private static final List<String> OUTWARD_TYPES = List.of(
            "DISPATCH", "TRANSFER_DISPATCH", "ADJUSTMENT_OUT", "PRODUCTION_ISSUE", "SCRAP", "OUTWARD");

    @Transactional(readOnly = true)
    public List<CostingDto> getCostingSummary(Long tenantId, Long warehouseId) {
        List<WareProducts> products = productsRepository.findByEnterpriseId(tenantId);
        
        return products.stream()
                .map(p -> calculateProductCosting(p.getId(), tenantId, warehouseId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CostingDto calculateProductCosting(Long productId, Long tenantId, Long warehouseId) {
        WareProducts p = productsRepository.findByIdAndEnterpriseId(productId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        List<InventoryImprovement> movements = inventoryRepository.findByProductIdAndEnterpriseId(productId, tenantId);

        // Filter by warehouse if provided
        if (warehouseId != null) {
            movements = movements.stream()
                    .filter(m -> m.getWarehouse() != null && warehouseId.equals(m.getWarehouse().getId()))
                    .collect(Collectors.toList());
        }

        List<InventoryImprovement> inwards = movements.stream()
                .filter(m -> INWARD_TYPES.contains(m.getType().name()))
                .collect(Collectors.toList());

        List<InventoryImprovement> outwards = movements.stream()
                .filter(m -> OUTWARD_TYPES.contains(m.getType().name()))
                .collect(Collectors.toList());

        // 1. Get Strategy
        PickingStrategy strategy = PickingStrategy.FEFO; // Default fallback
        if (warehouseId != null) {
            WareHouse wh = warehouseRepository.findById(warehouseId).orElse(null);
            if (wh != null && wh.getDefaultPickStrategy() != null) {
                strategy = wh.getDefaultPickStrategy();
            }
        }

        // 2. Sort inwards according to strategy
        if (strategy == PickingStrategy.FIFO) {
            inwards.sort(Comparator.comparing(InventoryImprovement::getMovementAt));
        } else if (strategy == PickingStrategy.LIFO) {
            inwards.sort(Comparator.comparing(InventoryImprovement::getMovementAt).reversed());
        } else if (strategy == PickingStrategy.FEFO) {
            inwards.sort(Comparator.comparing(m -> m.getBatch() != null && m.getBatch().getExpiryDate() != null 
                    ? m.getBatch().getExpiryDate() : LocalDate.MAX));
        }

        // 3. Compute COGS
        double totalOutwardQty = outwards.stream()
                .mapToDouble(m -> m.getQuantity() != null ? m.getQuantity() : 0.0).sum();
        
        double cogs = 0;
        double remainingOutward = totalOutwardQty;

        for (InventoryImprovement inward : inwards) {
            if (remainingOutward <= 0) break;
            double qty = inward.getQuantity() != null ? inward.getQuantity() : 0.0;
            double consume = Math.min(qty, remainingOutward);
            double cost = inward.getUnitCost() != null ? inward.getUnitCost() : 0.0;
            
            cogs += consume * cost;
            remainingOutward -= consume;
        }

        // 4. Compute Weighted Average Cost
        double totalInwardQty = inwards.stream()
                .mapToDouble(m -> m.getQuantity() != null ? m.getQuantity() : 0.0).sum();
        
        double totalInwardValue = inwards.stream()
                .mapToDouble(m -> m.getTotalCost() != null ? m.getTotalCost() : 0.0).sum();

        double wac = totalInwardQty > 0 ? totalInwardValue / totalInwardQty : 0.0;

        double totalOutwardValue = outwards.stream()
                .mapToDouble(m -> m.getTotalCost() != null ? m.getTotalCost() : 0.0).sum();

        return CostingDto.builder()
                .productId(p.getId())
                .productName(p.getName())
                .sku(p.getSku())
                .strategy(strategy.name())
                .cogs(BigDecimal.valueOf(cogs))
                .weightedAvgCost(BigDecimal.valueOf(wac))
                .totalInwardValue(BigDecimal.valueOf(totalInwardValue))
                .totalOutwardValue(BigDecimal.valueOf(totalOutwardValue))
                .build();
    }
}
