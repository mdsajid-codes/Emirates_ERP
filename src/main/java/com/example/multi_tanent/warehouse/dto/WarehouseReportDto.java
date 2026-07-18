package com.example.multi_tanent.warehouse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class WarehouseReportDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockLedgerEntry {
        private String movementNo;
        private String type;
        private Double quantity;
        private Double qtyBefore;
        private Double qtyAfter;
        private Double unitCost;
        private Double totalCost;
        private String referenceType;
        private Long referenceId;
        private String warehouseName;
        private LocalDateTime movementAt;
        private String remarks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockValuationItem {
        private Long productId;
        private String productName;
        private String sku;
        private BigDecimal purchasePrice;
        private BigDecimal salePrice;
        private BigDecimal currentStock;
        private BigDecimal stockValue;
        private String warehouseName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferHistoryItem {
        private String transferNumber;
        private String sourceWarehouse;
        private String destinationWarehouse;
        private String status;
        private LocalDate requestedDate;
        private int totalItems;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryPerformanceItem {
        private Long deliveryOrderId;
        private String deliveryOrderNumber;
        private String customerName;
        private String driverName;
        private String vehiclePlateNumber;
        private LocalDateTime dispatchedAt;
        private LocalDateTime deliveredAt;
        private long deliveryTimeMinutes;
        private String podStatus;
    }
}
