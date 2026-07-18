package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.AgingReportRow;
import com.example.multi_tanent.accounts.dto.subledger.PartyStatementRow;
import com.example.multi_tanent.accounts.dto.subledger.PartySubLedgerResponse;

import java.time.LocalDate;
import java.util.List;

public interface SubLedgerService {

    List<PartySubLedgerResponse> getArSummary(Long tenantId);
    List<PartyStatementRow> getArStatement(Long customerId, Long tenantId, LocalDate from, LocalDate to);
    List<AgingReportRow> getArAgingReport(Long tenantId, LocalDate asOfDate);

    List<PartySubLedgerResponse> getApSummary(Long tenantId);
    List<PartyStatementRow> getApStatement(Long supplierId, Long tenantId, LocalDate from, LocalDate to);
    List<AgingReportRow> getApAgingReport(Long tenantId, LocalDate asOfDate);

    List<PartySubLedgerResponse> getEmployeeSummary(Long tenantId);
    List<PartyStatementRow> getEmployeeStatement(Long employeeId, Long tenantId, LocalDate from, LocalDate to);

    List<PartySubLedgerResponse> getBankSummary(Long tenantId);
    List<PartyStatementRow> getBankStatement(Long bankAccountId, Long tenantId, LocalDate from, LocalDate to);
}
