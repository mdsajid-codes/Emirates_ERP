package com.example.multi_tanent.accounts.dto.subledger;

import com.example.multi_tanent.accounts.entity.BankReconciliation.ReconciliationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankReconciliationDto {
    private Long id;
    private Long bankAccountId;
    private LocalDate statementDate;
    private BigDecimal statementOpeningBalance;
    private BigDecimal statementClosingBalance;
    private BigDecimal clearedBalance;
    private ReconciliationStatus status;
    private List<ReconciliationMatchDto> matches;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconciliationMatchDto {
        private Long matchId;
        private Long journalEntryLineId;
        private Boolean isCleared;
        private BigDecimal amount;
        private String description;
        private LocalDate entryDate;
    }
}
