package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.BalanceSheetResponse;
import java.time.LocalDate;

public interface BalanceSheetService {
    BalanceSheetResponse getBalanceSheet(Long tenantId, LocalDate toDate);
}
