package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurAdditionalExpenseRequest {
    private String number;
    private LocalDate date;
    private Long supplierId;
    private String contract;
    private String transactionType;
    private Long purchaseOrderId;
    private String currency;
    private BigDecimal exchangeRate;
    private String comment;
    private String status;
    private List<PurAdditionalExpenseLineRequest> expenseLines;
    private List<PurAdditionalExpenseInventoryRequest> inventoryItems;
}
