package com.example.multi_tanent.sales.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAdditionalExpenseRequest {
    private String number;
    private LocalDate date;
    private Long companyId;
    private String contract;
    private String transactionType;
    private Long salesOrderId;
    private String currency;
    private BigDecimal exchangeRate;
    private String comment;
    private String status;
    private List<SalAdditionalExpenseLineRequest> expenseLines;
    private List<SalAdditionalExpenseInventoryRequest> inventoryItems;
}
