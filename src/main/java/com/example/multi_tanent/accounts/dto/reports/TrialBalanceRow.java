package com.example.multi_tanent.accounts.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialBalanceRow {
    private Long accountId;
    private String accountCode;
    private String description;
    private Integer level;
    private Boolean isGroup;
    private BigDecimal openingDebit;
    private BigDecimal openingCredit;
    private BigDecimal debitTurnover;
    private BigDecimal creditTurnover;
    private BigDecimal closingDebit;
    private BigDecimal closingCredit;
    private java.util.List<TrialBalanceRow> children;
}
