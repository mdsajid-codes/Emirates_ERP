package com.example.multi_tanent.accounts.dto.journal;

import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class JournalEntryResponse {
    private Long journalEntryId;
    private String entryNumber;
    private LocalDate entryDate;
    private LocalDate dueDate;
    private DocumentType documentType;
    private String description;
    private Long companyId;
    private String referenceNumber;
    private Long referenceId;
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private JournalEntryStatus status;
    private Long reversedById;
    private Long reversalOfId;
    private Long linkedInvoiceJeId;
    private LocalDateTime postedDate;
    private String postedBy;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<JournalEntryLineResponse> lines;
    private List<JournalEntryResponse> relatedEntries;

    @Data
    public static class JournalEntryLineResponse {
        private Long lineId;
        private Integer lineNumber;
        private Long accountId;
        private String accountCode;
        private String accountDescription;
        private BigDecimal debitAmount;
        private BigDecimal creditAmount;
        private BigDecimal quantity;
        private String description;

        // Dimensions
        private Long dimItemId;
        private String dimWarehouse;
        private Long dimCompanyId;
        private String dimContract;
        private Long dimEmployeeId;
        private Long dimExpenseItemId;
        private Long dimIncomeItemId;
        private Long dimBankAccountId;
        private Long dimTaxTypeId;
        private Long dimCashFlowItemId;
    }
}
