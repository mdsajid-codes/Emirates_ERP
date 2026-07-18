package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.enums.ManufacturingOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionDashboardDto {
    private MoStats moStats;
    private BigDecimal fgStockValue;
    private long rawMaterialAlerts;
    private List<MonthlyOutput> monthlyOutput;
    private List<TopFinishedGood> topFinishedGoods;
    private List<RecentMo> recentMos;
    private List<LowStockMaterial> lowStockMaterials;
    private List<DeliveryPerformance> deliveryTrend;
    private List<RecentMo> upcomingMos;
    private List<EmployeeWorkload> workloadSummary;
    private List<AlertItem> alerts;

    // Hanger-specific
    private Map<String, Long> hangerBatchPipeline;
    private List<ScrapRateData> scrapRateTrend;
    private QcPassRates qcPassRates;
    private List<RecentBatch> recentBatches;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoStats {
        private long total, scheduled, inProgress, completed, cancelled;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyOutput {
        private String month;
        private BigDecimal planned, actual;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopFinishedGood {
        private String name;
        private BigDecimal quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentMo {
        private Long id;
        private String moNumber, itemName;
        private ManufacturingOrderStatus status;
        private BigDecimal quantity;
        private OffsetDateTime dueDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockMaterial {
        private String name;
        private BigDecimal stockQuantity, reorderLimit;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryPerformance {
        private String month;
        private long onTime, late;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeWorkload {
        private String name;
        private long moCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertItem {
        private String type, message, severity, href;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScrapRateData {
        private String month;
        private double scrapPct;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QcPassRates {
        private long pass, conditionalPass, fail;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentBatch {
        private Long id;
        private String batchNo, hangerTypeName, stage, status;
    }
}
