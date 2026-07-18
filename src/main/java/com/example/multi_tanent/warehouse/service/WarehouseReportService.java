package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.sales.entity.DeliveryOrder;
import com.example.multi_tanent.sales.repository.DeliveryOrderRepository;
import com.example.multi_tanent.warehouse.dto.WarehouseReportDto;
import com.example.multi_tanent.warehouse.entity.InventoryImprovement;
import com.example.multi_tanent.warehouse.entity.TransferOrder;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.entity.WareProducts;
import com.example.multi_tanent.warehouse.repository.InventoryImprovementRepository;
import com.example.multi_tanent.warehouse.repository.TransferOrderRepository;
import com.example.multi_tanent.warehouse.repository.WareHouseRepository;
import com.example.multi_tanent.warehouse.repository.WareProductsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseReportService {

    private final InventoryImprovementRepository inventoryRepository;
    private final WareProductsRepository productsRepository;
    private final TransferOrderRepository transferRepository;
    private final DeliveryOrderRepository deliveryRepository;
    private final WareHouseRepository warehouseRepository;

    private static final List<String> INWARD_TYPES = List.of(
            "INBOUND_RECEIPT", "TRANSFER_RECEIVE", "ADJUSTMENT_IN", "PUT_AWAY", "PRODUCTION_RECEIPT", "QC_ACCEPT", "INWARD");

    private static final List<String> OUTWARD_TYPES = List.of(
            "DISPATCH", "TRANSFER_DISPATCH", "ADJUSTMENT_OUT", "PRODUCTION_ISSUE", "SCRAP", "OUTWARD");

    @Transactional(readOnly = true)
    public List<WarehouseReportDto.StockLedgerEntry> getStockLedger(Long productId, Long tenantId, LocalDateTime from, LocalDateTime to) {
        List<InventoryImprovement> movements = inventoryRepository.findByProductIdAndEnterpriseIdAndMovementAtBetween(productId, tenantId, from, to);
        
        return movements.stream()
                .sorted(Comparator.comparing(InventoryImprovement::getMovementAt))
                .map(m -> WarehouseReportDto.StockLedgerEntry.builder()
                        .movementNo(m.getMovementNo())
                        .type(m.getType().name())
                        .quantity(m.getQuantity())
                        .qtyBefore(m.getQtyBefore())
                        .qtyAfter(m.getQtyAfter())
                        .unitCost(m.getUnitCost())
                        .totalCost(m.getTotalCost())
                        .referenceType(m.getReferenceType() != null ? m.getReferenceType().name() : "N/A")
                        .referenceId(m.getReferenceId())
                        .warehouseName(m.getWarehouse() != null ? m.getWarehouse().getName() : "N/A")
                        .movementAt(m.getMovementAt())
                        .remarks(m.getRemarks())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WarehouseReportDto.StockValuationItem> getStockValuation(Long tenantId, Long warehouseId) {
        List<InventoryImprovement> movements = inventoryRepository.findByEnterpriseId(tenantId);
        List<WareProducts> products = productsRepository.findByEnterpriseId(tenantId);

        // Filter by warehouse if provided
        if (warehouseId != null) {
            movements = movements.stream()
                    .filter(m -> m.getWarehouse() != null && warehouseId.equals(m.getWarehouse().getId()))
                    .collect(Collectors.toList());
            products = products.stream()
                    .filter(p -> p.getWarehouse() != null && warehouseId.equals(p.getWarehouse().getId()))
                    .collect(Collectors.toList());
        }

        Map<Long, Double> totalProductStocks = movements.stream()
                .filter(m -> m.getProduct() != null)
                .collect(Collectors.groupingBy(
                        m -> m.getProduct().getId(),
                        Collectors.summingDouble(this::calculateMovementDelta)
                ));

        return products.stream().map(p -> {
            Double qty = totalProductStocks.getOrDefault(p.getId(), 0.0);
            BigDecimal currentStock = BigDecimal.valueOf(qty);
            BigDecimal stockValue = p.getPurchasePrice() != null ? p.getPurchasePrice().multiply(currentStock) : BigDecimal.ZERO;

            return WarehouseReportDto.StockValuationItem.builder()
                    .productId(p.getId())
                    .productName(p.getName())
                    .sku(p.getSku())
                    .purchasePrice(p.getPurchasePrice())
                    .salePrice(p.getSalePrice())
                    .currentStock(currentStock)
                    .stockValue(stockValue)
                    .warehouseName(p.getWarehouse() != null ? p.getWarehouse().getName() : "N/A")
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WarehouseReportDto.TransferHistoryItem> getTransferHistory(Long tenantId, LocalDate from, LocalDate to) {
        // Since repo doesn't have date between directly and spec is optional, we stream filter on page aggregate with fallback
        List<TransferOrder> transfers = transferRepository.findByEnterpriseId(tenantId, org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        return transfers.stream()
                .filter(t -> t.getRequestedDate() != null && !t.getRequestedDate().isBefore(from) && !t.getRequestedDate().isAfter(to))
                .map(t -> WarehouseReportDto.TransferHistoryItem.builder()
                        .transferNumber(t.getTransferNumber())
                        .sourceWarehouse(t.getSourceWarehouse() != null ? t.getSourceWarehouse().getName() : "N/A")
                        .destinationWarehouse(t.getDestinationWarehouse() != null ? t.getDestinationWarehouse().getName() : "N/A")
                        .status(t.getStatus().name())
                        .requestedDate(t.getRequestedDate())
                        .totalItems(t.getItems() != null ? t.getItems().size() : 0)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WarehouseReportDto.DeliveryPerformanceItem> getDeliveryPerformance(Long tenantId, LocalDateTime from, LocalDateTime to) {
        java.time.OffsetDateTime fromOffset = from.atOffset(java.time.ZoneOffset.UTC);
        java.time.OffsetDateTime toOffset = to.atOffset(java.time.ZoneOffset.UTC);

        List<DeliveryOrder> orders = deliveryRepository.findByTenantId(tenantId);
        
        return orders.stream()
                .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(fromOffset) && !o.getCreatedAt().isAfter(toOffset))
                .map(o -> {
                    long minutes = 0;
                    if (o.getDispatchedAt() != null && o.getDeliveredAt() != null) {
                        minutes = ChronoUnit.MINUTES.between(o.getDispatchedAt(), o.getDeliveredAt());
                    }
                    return WarehouseReportDto.DeliveryPerformanceItem.builder()
                            .deliveryOrderId(o.getId())
                            .deliveryOrderNumber(o.getDeliveryOrderNumber())
                            .customerName(o.getCustomer() != null ? o.getCustomer().getCompanyName() : "N/A")
                            .driverName(o.getDriver() != null ? o.getDriver().getName() : "N/A")
                            .vehiclePlateNumber(o.getVehicle() != null ? o.getVehicle().getPlateNumber() : "N/A")
                            .dispatchedAt(o.getDispatchedAt() != null ? o.getDispatchedAt().toLocalDateTime() : null)
                            .deliveredAt(o.getDeliveredAt() != null ? o.getDeliveredAt().toLocalDateTime() : null)
                            .deliveryTimeMinutes(minutes)
                            .podStatus(o.getStatus() != null ? o.getStatus().name() : "N/A")
                            .build();
                })
                .collect(Collectors.toList());
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
