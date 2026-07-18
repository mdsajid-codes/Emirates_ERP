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
public class IncomeStatementResponse {
    private List<IncomeStatementSection> sections;
    private BigDecimal grossProfit;
    private BigDecimal netProfit;
}
