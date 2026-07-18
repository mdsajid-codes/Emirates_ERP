package com.example.multi_tanent.accounts.dto.cashflow;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CashFlowTransactionRequest {
    private Long cashFlowItemId;
    private Long paymentId;
    private Long journalEntryId;
    private BigDecimal amount;
    private LocalDate transactionDate;
    private Boolean isInflow;
    private String description;
}
