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
public class SupplierSOAReportItemDto {

    private LocalDate date;
    private String refNo;
    private BigDecimal openingAmount;
    private BigDecimal receivedAmount;
    private BigDecimal pendingAmount;
    private BigDecimal postDatedAmount;
    private BigDecimal finalBalance;
    private LocalDate dueOn;
    private Long overdueDays;

    // Optional: Fields to handle Dr/Cr strings if needed in backend,
    // but typically frontend formats this based on sign.
    // We will send values.
    // Opening is typically Dr (Positive here for Payable).
    // Received is Cr (Payment).
}
