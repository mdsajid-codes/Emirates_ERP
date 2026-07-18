package com.example.multi_tanent.accounts.dto.reconciliation;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BankStatementLineResponse {
    private Long id;
    private LocalDate transactionDate;
    private BigDecimal amount;
    private String description;
    private Boolean isReconciled;
    private Long linkedJournalId;
    private String tenantId;
}
