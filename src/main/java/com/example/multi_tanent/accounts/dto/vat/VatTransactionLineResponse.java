package com.example.multi_tanent.accounts.dto.vat;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class VatTransactionLineResponse {
    private Long journalEntryId;
    private String journalEntryNumber;
    private LocalDate entryDate;
    private String documentType;
    private String description;
    private BigDecimal amount;
    private BigDecimal vatAmount;
    private Long glAccountId;
    private String glAccountName;
}
