package com.example.multi_tanent.accounts.dto.cashflow;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CashFlowStatementResponse {
    private LocalDate fromDate;
    private LocalDate toDate;
    
    private BigDecimal netCashFromOperating;
    private List<CashFlowSectionItem> operatingActivities;
    
    private BigDecimal netCashFromInvesting;
    private List<CashFlowSectionItem> investingActivities;
    
    private BigDecimal netCashFromFinancing;
    private List<CashFlowSectionItem> financingActivities;
    
    private BigDecimal netChangeInCash;
    private BigDecimal openingCashBalance;
    private BigDecimal closingCashBalance;

    @Data
    public static class CashFlowSectionItem {
        private String itemName;
        private BigDecimal amount;
    }
}
