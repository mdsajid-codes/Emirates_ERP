package com.example.multi_tanent.accounts.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeStatementSection {
    private String sectionName; // REVENUE, COGS, EXPENSES
    private List<AccountBalanceRow> accounts;
    private BigDecimal totalAmount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountBalanceRow {
        private String accountCode;
        private String description;
        private BigDecimal balance;
    }
}
