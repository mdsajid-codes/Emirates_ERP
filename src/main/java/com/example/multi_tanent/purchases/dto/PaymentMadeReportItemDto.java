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
public class PaymentMadeReportItemDto {

    private String paymentNumber; // Payment ID or custom ref
    private LocalDate paymentDate;
    private String referenceNumber; // Bank/Cheque Ref
    private String supplierName;
    private String paymentMethod;
    private String billNumbers; // Comma separated list of bills paid
    private BigDecimal amount; // Total Payment Amount
    private BigDecimal unusedAmount; // Amount not allocated
}
