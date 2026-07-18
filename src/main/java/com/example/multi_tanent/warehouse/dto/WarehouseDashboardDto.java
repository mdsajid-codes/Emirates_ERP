package com.example.multi_tanent.warehouse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseDashboardDto {
    
    private List<WarehouseStockSummary> stockSummaries;
    private List<RecentMovement> recentMovements;
    private long pendingGrnCount;
    private long pendingTransferCount;
    private List<TopProductByValue> topProductsByValue;
    private List<MovementBreakdown> movementBreakdown;
    private List<AlertItem> alerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseStockSummary {
        private Long warehouseId;
        private String warehouseName;
        private long totalProducts;
        private BigDecimal totalStockValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentMovement {
        private Long id;
        private String movementNo;
        private String type;
        private String productName;
        private Double quantity;
        private String warehouseName;
        private LocalDateTime movementAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductByValue {
        private Long productId;
        private String productName;
        private String sku;
        private BigDecimal stockValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovementBreakdown {
        private String type;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertItem {
        private String type;     // LOW_STOCK, OVERSTOCK, EXPIRING_SOON
        private String message;
        private String severity; // HIGH, MEDIUM, LOW
    }
}
