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
public class BillDetailsReportItemDto {

    private String status;
    private String billNumber;
    private LocalDate billDate;
    private LocalDate dueDate;
    private String referenceNumber; // Order Number or GRN
    private String supplierName;
    private BigDecimal billAmount;
    private BigDecimal balanceAmount;
    // Force Recompile
}
