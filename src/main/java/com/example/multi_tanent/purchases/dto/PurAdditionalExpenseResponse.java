package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurAdditionalExpenseResponse {
    private Long id;
    private String number;
    private LocalDate date;
    private Long supplierId;
    private String supplierName;
    private String contract;
    private String transactionType;
    private Long purchaseOrderId;
    private String poNumber;
    private String currency;
    private BigDecimal exchangeRate;
    private String comment;
    private String status;
    private BigDecimal totalAmount;
    private List<PurAdditionalExpenseLineResponse> expenseLines;
    private List<PurAdditionalExpenseInventoryResponse> inventoryItems;
    private String createdBy;
    private LocalDateTime createdAt;
}
