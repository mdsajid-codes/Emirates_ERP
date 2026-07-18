package com.example.multi_tanent.accounts.dto.subledger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovementRow {
    private Long journalEntryId;
    private String entryNumber;
    private LocalDate entryDate;
    private String documentType;
    private String referenceNumber;
    private String description;
    private BigDecimal qtyIn;
    private BigDecimal qtyOut;
    private BigDecimal runningQty;
    private BigDecimal debitAmount;
    private BigDecimal creditAmount;
    private BigDecimal runningBalance;
}
