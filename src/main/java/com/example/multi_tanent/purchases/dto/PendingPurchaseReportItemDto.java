package com.example.multi_tanent.purchases.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingPurchaseReportItemDto {

    private Long poId;
    private String poNumber;
    private LocalDate poDate;
    private String supplierName;
    private LocalDate deliveryDate;
    private Long leftDays;
    private String productDescription;
    private String unit;

    // Order Value
    private BigDecimal orderQty;
    private BigDecimal cancelQty;
    private BigDecimal orderRate;
    private BigDecimal orderValue;

    // Billed/Received As On Date
    private BigDecimal billedQty;
    private BigDecimal billedRate;
    private BigDecimal billedValue;

    // Pending Order
    private BigDecimal pendingQty;
    private BigDecimal pendingRate;
    private BigDecimal pendingValue;
}
