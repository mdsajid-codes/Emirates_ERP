package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.TrialBalanceRow;
import java.time.LocalDate;
import java.util.List;

public interface TrialBalanceService {
    List<TrialBalanceRow> getTrialBalance(Long tenantId, LocalDate fromDate, LocalDate toDate);
}
