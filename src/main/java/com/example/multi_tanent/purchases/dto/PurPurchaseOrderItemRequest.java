package com.example.multi_tanent.purchases.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchaseOrderItemRequest {
    @NotNull
    private Integer lineNumber;

    private Long categoryId;
    private Long subCategoryId;

    /** item could be raw material or other master */
    private Long itemId;
    private Long crmProductId;
    private Long rawMaterialId;
    private Long semiFinishedId;
    private Long finishedGoodId;

    private String description;

    @NotNull
    @DecimalMin("0.000001")
    private BigDecimal quantity;

    private Long unitId;
    private BigDecimal rate;

    private Long taxId;
    private Boolean taxExempt;
    private BigDecimal taxPercent;
    private BigDecimal lineDiscount;
    private BigDecimal discountPercent;
}
