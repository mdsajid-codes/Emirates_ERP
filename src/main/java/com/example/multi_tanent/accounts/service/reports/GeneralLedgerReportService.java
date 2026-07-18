package com.example.multi_tanent.accounts.service.reports;

import com.example.multi_tanent.accounts.dto.reports.GeneralLedgerRow;
import java.time.LocalDate;
import java.util.List;

public interface GeneralLedgerReportService {
    List<GeneralLedgerRow> getGeneralLedgerReport(Long tenantId, Long accountId, LocalDate fromDate, LocalDate toDate);
}
