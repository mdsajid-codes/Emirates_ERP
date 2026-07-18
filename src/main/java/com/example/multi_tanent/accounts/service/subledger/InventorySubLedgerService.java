package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.InventoryMovementRow;
import com.example.multi_tanent.accounts.dto.subledger.InventorySubLedgerSummary;

import java.time.LocalDate;
import java.util.List;

public interface InventorySubLedgerService {
    List<InventorySubLedgerSummary> getInventorySummary(Long tenantId);
    List<InventoryMovementRow> getInventoryMovement(Long itemId, Long tenantId, LocalDate from, LocalDate to);
    List<InventorySubLedgerSummary> getStockValuation(Long tenantId);
}
