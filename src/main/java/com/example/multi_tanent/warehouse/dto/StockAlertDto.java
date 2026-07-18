package com.example.multi_tanent.warehouse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAlertDto {

    private List<LowStockItem> lowStockItems;
    private List<OverStockItem> overStockItems;
    private List<ExpiringBatch> expiringBatches;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockItem {
        private Long productId;
        private String productName;
        private String sku;
        private String warehouseName;
        private BigDecimal currentStock;
        private BigDecimal minStockLevel;
        private BigDecimal reorderPoint;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverStockItem {
        private Long productId;
        private String productName;
        private String sku;
        private String warehouseName;
        private BigDecimal currentStock;
        private BigDecimal maxStockLevel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpiringBatch {
        private Long batchId;
        private String batchNumber;
        private Long productId;
        private String productName;
        private LocalDate expiryDate;
        private long daysUntilExpiry;
    }
}
