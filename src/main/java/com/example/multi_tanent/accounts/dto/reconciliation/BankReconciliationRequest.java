package com.example.multi_tanent.accounts.dto.reconciliation;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class BankReconciliationRequest {
    private Long bankAccountId;
    private LocalDate statementDate;
    private BigDecimal statementBalance;
    private List<BankStatementLineRequest> lines;
}
