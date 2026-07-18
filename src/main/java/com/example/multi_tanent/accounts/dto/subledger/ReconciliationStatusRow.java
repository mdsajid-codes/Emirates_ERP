package com.example.multi_tanent.accounts.dto.subledger;

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
public class ReconciliationStatusRow {
    private String subLedgerKey; // e.g., ar, ap, employee, bank, inventory, fixed-assets
    private String subLedgerName;
    private List<String> controlAccountCodes;
    private BigDecimal glBalance;
    private BigDecimal subLedgerTotal;
    private BigDecimal difference;
    private boolean isBalanced;
    private int untaggedLineCount;
    private String drillDownUrl;
}
