package com.example.multi_tanent.sales.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAdditionalExpenseResponse {
    private Long id;
    private String number;
    private LocalDate date;
    private Long companyId;
    private String companyName;
    private String contract;
    private String transactionType;
    private Long salesOrderId;
    private String salesOrderNumber;
    private String currency;
    private BigDecimal exchangeRate;
    private String comment;
    private String status;
    private BigDecimal totalAmount;
    private List<SalAdditionalExpenseLineResponse> expenseLines;
    private List<SalAdditionalExpenseInventoryResponse> inventoryItems;
    private String createdBy;
    private LocalDateTime createdAt;
}
