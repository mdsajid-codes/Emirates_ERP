package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.IncomeStatementResponse;
import java.time.LocalDate;

public interface IncomeStatementService {
    IncomeStatementResponse getIncomeStatement(Long tenantId, LocalDate fromDate, LocalDate toDate);
}
