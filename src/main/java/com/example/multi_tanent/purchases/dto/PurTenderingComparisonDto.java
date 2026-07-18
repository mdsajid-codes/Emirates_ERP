package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurTenderingComparisonDto {
    private Long tenderingId;
    private String tenderNumber;

    // A map from Item ID -> (Map from Supplier ID -> Price Quoted)
    // Or we can return a list of items, where each item has quotes by supplier
    private List<ItemComparison> itemComparisons;

    // A map from Question ID -> (Map from Supplier ID -> Answer)
    private List<QuestionComparison> questionComparisons;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemComparison {
        private Long tenderingItemId;
        private String itemName;
        private BigDecimal requiredQuantity;
        // Key is SupplierId (or Supplier Name), value is Price (or ResponseItemDto)
        private Map<Long, BigDecimal> supplierPrices;
        private Long bestSupplierId; // calculated best supplier
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionComparison {
        private Long tenderingQuestionId;
        private String questionText;
        private Map<Long, String> supplierAnswers;
    }
}
