package com.example.multi_tanent.accounts.dto.investment;

import com.example.multi_tanent.accounts.entity.enums.CashEquivStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccCashEquivalentResponse {
    private Long id;
    private String name;
    private Long bankAccountId;
    private BigDecimal amount;
    private LocalDate investmentDate;
    private LocalDate maturityDate;
    private BigDecimal interestRate;
    private Long glAccountId;
    private CashEquivStatus status;
    private Long journalEntryId;
    private Long maturityJournalId;
    private String tenantId;
}
