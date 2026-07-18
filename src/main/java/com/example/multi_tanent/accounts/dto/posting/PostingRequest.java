package com.example.multi_tanent.accounts.dto.posting;

import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class PostingRequest {
    private DocumentType documentType;
    private Long referenceId;
    private String referenceNumber;
    private LocalDate entryDate;
    private LocalDate dueDate;
    private String description;
    private Long companyId; // used for looking up default AR/AP account
    private Long linkedInvoiceJeId;
    private List<Line> lines;

    @Data
    public static class Line {
        private Long itemId; // used for looking up default item GL accounts
        private BigDecimal amount;
        private BigDecimal quantity;
        private String description;
        private BigDecimal taxPercentage;

        // Optional Dimensions to flow to the Journal Entry lines
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
