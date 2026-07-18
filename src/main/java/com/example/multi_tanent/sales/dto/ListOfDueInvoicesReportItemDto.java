package com.example.multi_tanent.sales.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ListOfDueInvoicesReportItemDto {
    private Long id;
    private String refNo;
    private String customerName;
    private String type;
    private LocalDate dated;
    private BigDecimal totalAmt;
    private BigDecimal pendingAmt;
    private LocalDate dueDate;
    private Long days;
}
