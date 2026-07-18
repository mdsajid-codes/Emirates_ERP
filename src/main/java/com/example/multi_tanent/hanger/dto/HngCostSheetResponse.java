package com.example.multi_tanent.hanger.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngCostSheetResponse {
    private Long batchId;
    private String batchNo;

    private BigDecimal laborCost;
    private BigDecimal materialCost; // Chemical/Paint
    private BigDecimal electricityCost;
    private BigDecimal totalEstimatedCost;

    private List<CostLineItem> breakdown;

    @Data
    @AllArgsConstructor
    public static class CostLineItem {
        private String category;
        private String description;
        private BigDecimal rate;
        private BigDecimal quantity;
        private BigDecimal Subtotal;
    }
}
