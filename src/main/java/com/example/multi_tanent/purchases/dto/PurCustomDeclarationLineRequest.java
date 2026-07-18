package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurCustomDeclarationLineRequest {
    private Integer lineNumber;
    private Long purchaseInvoiceId;
    private Long itemId;
    private String hsCode;
    private String origin;
    private BigDecimal cifForeignValue;
    private BigDecimal exchangeRate;
    private BigDecimal cifNationalValue;
    private BigDecimal dutyRate;
    private BigDecimal dutyAmount;
    private BigDecimal serviceChargeAllocation;
    private BigDecimal vatRate;
    private BigDecimal vatAmount;
}
