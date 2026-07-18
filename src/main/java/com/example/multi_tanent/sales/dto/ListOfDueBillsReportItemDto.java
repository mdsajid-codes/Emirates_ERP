package com.example.multi_tanent.sales.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ListOfDueBillsReportItemDto {
    private Long id;
    private String refNo; // Invoice Number
    private String customerName;
    private String type; // "Sale"
    private LocalDate dated; // Invoice Date
    private BigDecimal totalAmt;
    private BigDecimal pendingAmt;
    private LocalDate dueDate;
    private Long days; // Overdue days
}
