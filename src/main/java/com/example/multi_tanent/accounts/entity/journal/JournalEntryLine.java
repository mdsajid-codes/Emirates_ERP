package com.example.multi_tanent.accounts.entity.journal;

import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "journal_entry_lines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"journalEntry", "account"})
public class JournalEntryLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "line_id")
    private Long lineId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id", nullable = false)
    private JournalEntry journalEntry;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private ChartOfAccount account;

    @Builder.Default
    @Column(name = "debit_amount", precision = 19, scale = 2)
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "credit_amount", precision = 19, scale = 2)
    private BigDecimal creditAmount = BigDecimal.ZERO;

    @Column(precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(length = 500)
    private String description;

    // Dimensions
    @Column(name = "dim_item_id")
    private Long dimItemId;

    @Column(name = "dim_warehouse", length = 100)
    private String dimWarehouse;

    @Column(name = "dim_company_id")
    private Long dimCompanyId;

    @Column(name = "dim_contract", length = 100)
    private String dimContract;

    @Column(name = "dim_employee_id")
    private Long dimEmployeeId;

    @Column(name = "dim_expense_item_id")
    private Long dimExpenseItemId;

    @Column(name = "dim_income_item_id")
    private Long dimIncomeItemId;

    @Column(name = "dim_bank_account_id")
    private Long dimBankAccountId;

    @Column(name = "dim_tax_type_id")
    private Long dimTaxTypeId;

    @Column(name = "dim_cash_flow_item_id")
    private Long dimCashFlowItemId;

    @Column(name = "original_debit_amount", precision = 19, scale = 2)
    private BigDecimal originalDebitAmount;

    @Column(name = "original_credit_amount", precision = 19, scale = 2)
    private BigDecimal originalCreditAmount;
}
