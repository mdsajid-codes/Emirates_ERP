package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.ReconciliationStatusRow;
import com.example.multi_tanent.accounts.dto.subledger.UntaggedLineRow;

import java.util.List;

public interface ReconciliationDashboardService {
    List<ReconciliationStatusRow> getReconciliationSummary(Long tenantId);
    List<UntaggedLineRow> getUntaggedLines(String subLedgerKey, Long tenantId);
}
