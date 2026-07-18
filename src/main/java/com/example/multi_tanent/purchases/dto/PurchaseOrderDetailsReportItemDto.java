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
public class PurchaseOrderDetailsReportItemDto {

    private String status;
    private String poNumber;
    private LocalDate date;
    private LocalDate deliveryDate;
    private String reference;
    private String supplierName;
    private BigDecimal amount;
    private BigDecimal amountInDefaultCurrency;
}
