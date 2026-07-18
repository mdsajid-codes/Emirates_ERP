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
public class PartyStatementRow {
    private Long journalEntryId;
    private String entryNumber;
    private LocalDate entryDate;
    private LocalDate dueDate;
    private String documentType;
    private String referenceNumber;
    private String description;
    
    @Builder.Default
    private BigDecimal debitAmount = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal creditAmount = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal runningBalance = BigDecimal.ZERO;

    @Builder.Default
    private boolean isOpeningBalance = false;
}
