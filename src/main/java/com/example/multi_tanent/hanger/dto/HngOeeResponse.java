package com.example.multi_tanent.hanger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngOeeResponse {
    private BigDecimal avgAvailability;
    private BigDecimal avgPerformance;
    private BigDecimal avgQuality;
    private BigDecimal avgOee;
    private int totalJobCards;
    private int totalProducedQty;
    private int totalRejectedQty;
    private List<BatchOeeItem> batches;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchOeeItem {
        private Long batchId;
        private String batchNo;
        private String jobCardNo;
        private BigDecimal availability;
        private BigDecimal performance;
        private BigDecimal quality;
        private BigDecimal oee;
        private Integer producedQty;
        private Integer rejectedQty;
        private OffsetDateTime createdAt;
    }
}
