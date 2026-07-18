package com.example.multi_tanent.purchases.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchaseInvoiceItemRequest {
    @NotNull
    private Integer lineNumber;

    private Long categoryId;
    private Long subCategoryId;
    private Long itemId;

    private String description;

    // gross/net amounts
    @DecimalMin("0.000001")
    private BigDecimal quantityGross;
    @DecimalMin("0.000001")
    private BigDecimal quantityNet;

    private Long unitId;

    private BigDecimal rate;
    private BigDecimal amount;

    private Long taxId;
    private BigDecimal taxPercent;

    private BigDecimal lineDiscount;
    private BigDecimal discountPercent;
}
