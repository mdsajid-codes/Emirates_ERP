package com.example.multi_tanent.purchases.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierBalanceReportItemDto {

    private String supplierName;

    // Bill Amounts
    @Builder.Default
    private BigDecimal billAmountInr = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal billAmountKwd = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal billAmountUsd = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal billAmountCad = BigDecimal.ZERO;

    // Received Amounts
    @Builder.Default
    private BigDecimal receivedAmountInr = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal receivedAmountKwd = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal receivedAmountUsd = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal receivedAmountCad = BigDecimal.ZERO;

    // Balance Amounts
    @Builder.Default
    private BigDecimal balanceAmountInr = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal balanceAmountKwd = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal balanceAmountUsd = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal balanceAmountCad = BigDecimal.ZERO;
}
