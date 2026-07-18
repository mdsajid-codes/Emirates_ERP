package com.example.multi_tanent.accounts.dto.journal;

import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class JournalEntryRequest {
    private LocalDate entryDate;
    private LocalDate dueDate;
    private DocumentType documentType;
    private String description;
    private Long companyId;
    private String referenceNumber;
    private Long referenceId;
    private Long linkedInvoiceJeId;
    private List<JournalEntryLineRequest> lines;

    @Data
    public static class JournalEntryLineRequest {
        private Integer lineNumber;
        private Long accountId;
        private BigDecimal debitAmount;
        private BigDecimal creditAmount;
        private BigDecimal quantity;
        private String description;

        // Optional Dimensions
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
