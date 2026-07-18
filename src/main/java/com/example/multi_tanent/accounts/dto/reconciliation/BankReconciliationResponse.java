package com.example.multi_tanent.accounts.dto.reconciliation;

import com.example.multi_tanent.accounts.entity.enums.ReconciliationStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class BankReconciliationResponse {
    private Long id;
    private Long bankAccountId;
    private LocalDate statementDate;
    private BigDecimal statementBalance;
    private BigDecimal glBalance;
    private ReconciliationStatus status;
    private String tenantId;
    private List<BankStatementLineResponse> statementLines;
    private List<GlLineResponse> glLines;
}
