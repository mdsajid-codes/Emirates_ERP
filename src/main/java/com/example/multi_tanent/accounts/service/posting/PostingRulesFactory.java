package com.example.multi_tanent.accounts.service.posting;

import com.example.multi_tanent.accounts.dto.journal.JournalEntryRequest.JournalEntryLineRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.accounts.entity.enums.PartyType;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PostingRulesFactory {

    private final GLAccountResolver resolver;

    public List<JournalEntryLineRequest> generateLines(PostingRequest request, Long tenantId) {
        DocumentType docType = request.getDocumentType();
        List<JournalEntryLineRequest> generatedLines = new ArrayList<>();

        switch (docType) {
            case SUPPLIER_INVOICE:
                generateSupplierInvoiceLines(request, tenantId, generatedLines);
                break;
            case CUSTOMER_INVOICE:
                generateCustomerInvoiceLines(request, tenantId, generatedLines);
                break;
            case CREDIT_NOTE:
                generateCreditNoteLines(request, tenantId, generatedLines);
                break;
            case PAYMENT_VOUCHER_BANK:
                generatePaymentVoucherLines(request, tenantId, generatedLines);
                break;
            case PAYMENT_VOUCHER_CASH:
                generatePaymentVoucherLines(request, tenantId, generatedLines);
                break;
            case RECEIPT_VOUCHER_BANK:
                generateReceiptVoucherLines(request, tenantId, generatedLines);
                break;
            case RECEIPT_VOUCHER_CASH:
                generateReceiptVoucherLines(request, tenantId, generatedLines);
                break;
            case INVENTORY_TRANSFER:
                generateInventoryTransferLines(request, tenantId, generatedLines);
                break;
            case INVENTORY_WRITEOFF:
                generateInventoryWriteOffLines(request, tenantId, generatedLines);
                break;
            case FLEET_EXPENSE:
                generateFleetExpenseLines(request, tenantId, generatedLines);
                break;
            case ASSET_ACQUISITION:
                generateAssetAcquisitionLines(request, tenantId, generatedLines);
                break;
            case DEPRECIATION_RUN:
                generateDepreciationRunLines(request, tenantId, generatedLines);
                break;
            case PAYROLL_RUN:
                generatePayrollRunLines(request, tenantId, generatedLines);
                break;
            case SALARY_PAYMENT:
                generateSalaryPaymentLines(request, tenantId, generatedLines);
                break;
            case POS_SALE:
                generatePosSaleLines(request, tenantId, generatedLines);
                break;
            default:
                throw new UnsupportedOperationException("Document type " + docType + " is not yet supported by the Posting Engine.");
        }

        // Set line numbers (1-indexed, mandatory!)
        int lineNumber = 1;
        for (JournalEntryLineRequest line : generatedLines) {
            line.setLineNumber(lineNumber++);
        }

        return generatedLines;
    }

    private ChartOfAccount fallbackOrThrow(AccountSection section, Long tenantId, String errorMessage) {
        try {
            return resolver.resolveAccountBySection(section, tenantId);
        } catch (NoSuchElementException e) {
            throw new NoSuchElementException(errorMessage + ". Fallback to section " + section + " also failed: " + e.getMessage());
        }
    }

    private void populateDimensions(PostingRequest.Line source, JournalEntryLineRequest target) {
        target.setQuantity(source.getQuantity());
        target.setDescription(source.getDescription());
        target.setDimItemId(source.getDimItemId());
        target.setDimWarehouse(source.getDimWarehouse());
        target.setDimCompanyId(source.getDimCompanyId());
        target.setDimContract(source.getDimContract());
        target.setDimEmployeeId(source.getDimEmployeeId());
        target.setDimExpenseItemId(source.getDimExpenseItemId());
        target.setDimIncomeItemId(source.getDimIncomeItemId());
        target.setDimBankAccountId(source.getDimBankAccountId());
        target.setDimTaxTypeId(source.getDimTaxTypeId());
        target.setDimCashFlowItemId(source.getDimCashFlowItemId());
    }

    private void generateSupplierInvoiceLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // AP account lookup
        ChartOfAccount apAccount;
        try {
            apAccount = resolver.resolvePartyAccount(request.getCompanyId(), PartyType.SUPPLIER, "AP", tenantId);
        } catch (Exception e) {
            apAccount = fallbackOrThrow(AccountSection.BS_TRADE_PAYABLES, tenantId, 
                    "Failed to resolve AP account for supplier " + request.getCompanyId() + ": " + e.getMessage());
        }

        for (PostingRequest.Line line : request.getLines()) {
            // Purchases/Inventory account lookup
            ChartOfAccount goodsAccount;
            try {
                if (line.getItemId() != null) {
                    goodsAccount = resolver.resolveItemAccount(line.getItemId(), "PURCHASES", tenantId);
                } else {
                    goodsAccount = resolver.resolveAccountBySection(AccountSection.BS_INVENTORIES, tenantId);
                }
            } catch (Exception e) {
                goodsAccount = fallbackOrThrow(AccountSection.BS_INVENTORIES, tenantId, 
                        "Failed to resolve Purchases/Inventory account: " + e.getMessage());
            }

            // Dr: Purchases/Inventory
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(goodsAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            totalAmount = totalAmount.add(line.getAmount());

            // Handle Input VAT if dimTaxTypeId is specified on line
            if (line.getDimTaxTypeId() != null) {
                ChartOfAccount vatAccount;
                try {
                    if (line.getItemId() != null) {
                        vatAccount = resolver.resolveItemAccount(line.getItemId(), "INPUT_VAT", tenantId);
                    } else {
                        vatAccount = resolver.resolveAccountBySection(AccountSection.BS_INPUT_VAT, tenantId);
                    }
                } catch (Exception e) {
                    vatAccount = fallbackOrThrow(AccountSection.BS_INPUT_VAT, tenantId,
                            "Failed to resolve Input VAT account: " + e.getMessage());
                }
            }
        }

        // Cr: Trade Payables
        JournalEntryLineRequest crLine = new JournalEntryLineRequest();
        crLine.setAccountId(apAccount.getAccountId());
        crLine.setDebitAmount(BigDecimal.ZERO);
        crLine.setCreditAmount(totalAmount);
        crLine.setDimCompanyId(request.getCompanyId());
        targetLines.add(crLine);
    }

    private void generateCustomerInvoiceLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        // AR account lookup
        ChartOfAccount arAccount;
        try {
            arAccount = resolver.resolvePartyAccount(request.getCompanyId(), PartyType.CUSTOMER, "AR", tenantId);
        } catch (Exception e) {
            arAccount = fallbackOrThrow(AccountSection.BS_TRADE_RECEIVABLES, tenantId,
                    "Failed to resolve AR account for customer " + request.getCompanyId() + ": " + e.getMessage());
        }

        for (PostingRequest.Line line : request.getLines()) {
            // Sales/Revenue account lookup
            ChartOfAccount salesAccount;
            try {
                if (line.getItemId() != null) {
                    salesAccount = resolver.resolveItemAccount(line.getItemId(), "SALES", tenantId);
                } else {
                    salesAccount = resolver.resolveAccountBySection(AccountSection.PL_SALES_GOODS, tenantId);
                }
            } catch (Exception e) {
                salesAccount = fallbackOrThrow(AccountSection.PL_SALES_GOODS, tenantId,
                        "Failed to resolve Sales account: " + e.getMessage());
            }

            // Cr: Sales
            JournalEntryLineRequest crLine = new JournalEntryLineRequest();
            crLine.setAccountId(salesAccount.getAccountId());
            crLine.setDebitAmount(BigDecimal.ZERO);
            crLine.setCreditAmount(line.getAmount());
            populateDimensions(line, crLine);
            targetLines.add(crLine);

            totalAmount = totalAmount.add(line.getAmount());

            if (line.getDimTaxTypeId() != null && line.getTaxPercentage() != null) {
                ChartOfAccount vatAccount;
                try {
                    if (line.getItemId() != null) {
                        vatAccount = resolver.resolveItemAccount(line.getItemId(), "OUTPUT_VAT", tenantId);
                    } else {
                        vatAccount = resolver.resolveAccountBySection(AccountSection.BS_VAT_PAYABLE, tenantId);
                    }
                } catch (Exception e) {
                    vatAccount = fallbackOrThrow(AccountSection.BS_VAT_PAYABLE, tenantId,
                            "Failed to resolve Output VAT account");
                }

                BigDecimal vatAmount = line.getAmount().multiply(line.getTaxPercentage()).divide(BigDecimal.valueOf(100));

                JournalEntryLineRequest vatLine = new JournalEntryLineRequest();
                vatLine.setAccountId(vatAccount.getAccountId());
                vatLine.setDebitAmount(BigDecimal.ZERO);
                vatLine.setCreditAmount(vatAmount);
                vatLine.setDimTaxTypeId(line.getDimTaxTypeId());
                targetLines.add(vatLine);

                totalAmount = totalAmount.add(vatAmount);
            }
        }

        // Dr: Trade Receivables
        JournalEntryLineRequest drLine = new JournalEntryLineRequest();
        drLine.setAccountId(arAccount.getAccountId());
        drLine.setDebitAmount(totalAmount);
        drLine.setCreditAmount(BigDecimal.ZERO);
        drLine.setDimCompanyId(request.getCompanyId());
        targetLines.add(drLine);
    }

    private void generateCreditNoteLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        ChartOfAccount arAccount;
        try {
            arAccount = resolver.resolvePartyAccount(request.getCompanyId(), PartyType.CUSTOMER, "AR", tenantId);
        } catch (Exception e) {
            arAccount = fallbackOrThrow(AccountSection.BS_TRADE_RECEIVABLES, tenantId,
                    "Failed to resolve AR account for credit note");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (PostingRequest.Line line : request.getLines()) {
            ChartOfAccount revenueAccount;
            try {
                if (line.getItemId() != null) {
                    revenueAccount = resolver.resolveItemAccount(line.getItemId(), "SALES", tenantId);
                } else {
                    revenueAccount = resolver.resolveAccountBySection(AccountSection.PL_SALES_GOODS, tenantId);
                }
            } catch (Exception e) {
                revenueAccount = fallbackOrThrow(AccountSection.PL_SALES_GOODS, tenantId,
                        "Failed to resolve revenue account for credit note");
            }

            // Dr: Sales Revenue (reversal)
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(revenueAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            totalAmount = totalAmount.add(line.getAmount());
        }

        // Cr: AR (reduces customer AR balance)
        JournalEntryLineRequest crLine = new JournalEntryLineRequest();
        crLine.setAccountId(arAccount.getAccountId());
        crLine.setDebitAmount(BigDecimal.ZERO);
        crLine.setCreditAmount(totalAmount);
        crLine.setDimCompanyId(request.getCompanyId());
        targetLines.add(crLine);
    }

    private void generatePaymentVoucherLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Cash/Bank account lookup
        ChartOfAccount cashBankAccount;
        try {
            cashBankAccount = resolver.resolveAccountBySection(AccountSection.BS_CASH, tenantId);
        } catch (Exception e) {
            cashBankAccount = fallbackOrThrow(AccountSection.BS_CASH, tenantId,
                    "Failed to resolve payment source account: " + e.getMessage());
        }

        for (PostingRequest.Line line : request.getLines()) {
            // Debit: Trade Payables (usually AP) or target account specified by itemId/dimension
            ChartOfAccount debitAccount;
            try {
                if (line.getDimCompanyId() != null) {
                    debitAccount = resolver.resolvePartyAccount(line.getDimCompanyId(), PartyType.SUPPLIER, "AP", tenantId);
                } else {
                    debitAccount = resolver.resolveAccountBySection(AccountSection.BS_TRADE_PAYABLES, tenantId);
                }
            } catch (Exception e) {
                debitAccount = fallbackOrThrow(AccountSection.BS_TRADE_PAYABLES, tenantId,
                        "Failed to resolve AP account for payment line: " + e.getMessage());
            }

            // Dr: AP
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(debitAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            totalAmount = totalAmount.add(line.getAmount());
        }

        // Cr: Cash/Bank
        JournalEntryLineRequest crLine = new JournalEntryLineRequest();
        crLine.setAccountId(cashBankAccount.getAccountId());
        crLine.setDebitAmount(BigDecimal.ZERO);
        crLine.setCreditAmount(totalAmount);
        targetLines.add(crLine);
    }

    private void generateReceiptVoucherLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Cash/Bank account lookup
        ChartOfAccount cashBankAccount;
        try {
            cashBankAccount = resolver.resolveAccountBySection(AccountSection.BS_CASH, tenantId);
        } catch (Exception e) {
            cashBankAccount = fallbackOrThrow(AccountSection.BS_CASH, tenantId,
                    "Failed to resolve receipt destination account: " + e.getMessage());
        }

        for (PostingRequest.Line line : request.getLines()) {
            // Credit: Trade Receivables (usually AR)
            ChartOfAccount creditAccount;
            try {
                if (line.getDimCompanyId() != null) {
                    creditAccount = resolver.resolvePartyAccount(line.getDimCompanyId(), PartyType.CUSTOMER, "AR", tenantId);
                } else {
                    creditAccount = resolver.resolveAccountBySection(AccountSection.BS_TRADE_RECEIVABLES, tenantId);
                }
            } catch (Exception e) {
                creditAccount = fallbackOrThrow(AccountSection.BS_TRADE_RECEIVABLES, tenantId,
                        "Failed to resolve AR account for receipt line: " + e.getMessage());
            }

            // Cr: AR
            JournalEntryLineRequest crLine = new JournalEntryLineRequest();
            crLine.setAccountId(creditAccount.getAccountId());
            crLine.setDebitAmount(BigDecimal.ZERO);
            crLine.setCreditAmount(line.getAmount());
            populateDimensions(line, crLine);
            targetLines.add(crLine);

            totalAmount = totalAmount.add(line.getAmount());
        }

        // Dr: Cash/Bank
        JournalEntryLineRequest drLine = new JournalEntryLineRequest();
        drLine.setAccountId(cashBankAccount.getAccountId());
        drLine.setDebitAmount(totalAmount);
        drLine.setCreditAmount(BigDecimal.ZERO);
        targetLines.add(drLine);
    }

    private void generateInventoryTransferLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        for (PostingRequest.Line line : request.getLines()) {
            ChartOfAccount inventoryAccount;
            try {
                if (line.getItemId() != null) {
                    inventoryAccount = resolver.resolveItemAccount(line.getItemId(), "INVENTORY", tenantId);
                } else {
                    inventoryAccount = resolver.resolveAccountBySection(AccountSection.BS_INVENTORIES, tenantId);
                }
            } catch (Exception e) {
                inventoryAccount = fallbackOrThrow(AccountSection.BS_INVENTORIES, tenantId,
                        "Failed to resolve Inventory account: " + e.getMessage());
            }

            // Cr: Source Location/Warehouse
            JournalEntryLineRequest crLine = new JournalEntryLineRequest();
            crLine.setAccountId(inventoryAccount.getAccountId());
            crLine.setDebitAmount(BigDecimal.ZERO);
            crLine.setCreditAmount(line.getAmount());
            populateDimensions(line, crLine);
            targetLines.add(crLine);

            // Dr: Destination Location/Warehouse
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(inventoryAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            if (line.getDescription() != null && line.getDescription().contains("->")) {
                String[] parts = line.getDescription().split("->");
                if (parts.length > 1) {
                    drLine.setDimWarehouse(parts[1].trim());
                }
            }
            targetLines.add(drLine);
        }
    }

    private void generateInventoryWriteOffLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        for (PostingRequest.Line line : request.getLines()) {
            ChartOfAccount inventoryAccount;
            try {
                if (line.getItemId() != null) {
                    inventoryAccount = resolver.resolveItemAccount(line.getItemId(), "INVENTORY", tenantId);
                } else {
                    inventoryAccount = resolver.resolveAccountBySection(AccountSection.BS_INVENTORIES, tenantId);
                }
            } catch (Exception e) {
                inventoryAccount = fallbackOrThrow(AccountSection.BS_INVENTORIES, tenantId,
                        "Failed to resolve Inventory account: " + e.getMessage());
            }

            ChartOfAccount expenseAccount = fallbackOrThrow(AccountSection.PL_OPERATING_EXPENSES, tenantId,
                    "Failed to resolve Writeoff Expense account");

            // Dr: Writeoff Expense
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(expenseAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            // Cr: Inventory
            JournalEntryLineRequest crLine = new JournalEntryLineRequest();
            crLine.setAccountId(inventoryAccount.getAccountId());
            crLine.setDebitAmount(BigDecimal.ZERO);
            crLine.setCreditAmount(line.getAmount());
            populateDimensions(line, crLine);
            targetLines.add(crLine);
        }
    }

    private void generateFleetExpenseLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PostingRequest.Line line : request.getLines()) {
            ChartOfAccount expenseAccount = fallbackOrThrow(AccountSection.PL_FUEL_TRANSPORT, tenantId, 
                    "Failed to resolve fuel transport account");

            // Dr: Expense
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(expenseAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            totalAmount = totalAmount.add(line.getAmount());
        }

        // Cr: Cash or Payables
        ChartOfAccount creditAccount;
        try {
            if (request.getCompanyId() != null) {
                creditAccount = resolver.resolvePartyAccount(request.getCompanyId(), PartyType.SUPPLIER, "AP", tenantId);
            } else {
                creditAccount = resolver.resolveAccountBySection(AccountSection.BS_CASH, tenantId);
            }
        } catch (Exception e) {
            creditAccount = fallbackOrThrow(AccountSection.BS_CASH, tenantId,
                    "Failed to resolve fleet expense credit account: " + e.getMessage());
        }

        JournalEntryLineRequest crLine = new JournalEntryLineRequest();
        crLine.setAccountId(creditAccount.getAccountId());
        crLine.setDebitAmount(BigDecimal.ZERO);
        crLine.setCreditAmount(totalAmount);
        targetLines.add(crLine);
    }

    private void generateAssetAcquisitionLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        ChartOfAccount assetAccount = fallbackOrThrow(AccountSection.BS_FIXED_ASSETS, tenantId,
                "Failed to resolve fixed assets account");

        for (PostingRequest.Line line : request.getLines()) {
            // Dr: Fixed Assets
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(assetAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            totalAmount = totalAmount.add(line.getAmount());
        }

        // Cr: Cash/Bank or Supplier Payables
        ChartOfAccount creditAccount;
        try {
            if (request.getCompanyId() != null) {
                creditAccount = resolver.resolvePartyAccount(request.getCompanyId(), PartyType.SUPPLIER, "AP", tenantId);
            } else {
                creditAccount = resolver.resolveAccountBySection(AccountSection.BS_CASH, tenantId);
            }
        } catch (Exception e) {
            creditAccount = fallbackOrThrow(AccountSection.BS_CASH, tenantId,
                    "Failed to resolve credit account for asset acquisition: " + e.getMessage());
        }

        JournalEntryLineRequest crLine = new JournalEntryLineRequest();
        crLine.setAccountId(creditAccount.getAccountId());
        crLine.setDebitAmount(BigDecimal.ZERO);
        crLine.setCreditAmount(totalAmount);
        targetLines.add(crLine);
    }

    private void generateDepreciationRunLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        ChartOfAccount expenseAccount = fallbackOrThrow(AccountSection.PL_DEPRECIATION, tenantId,
                "Failed to resolve depreciation expense account");

        ChartOfAccount accumulatedDepAccount = fallbackOrThrow(AccountSection.BS_ACCUMULATED_DEPRECIATION, tenantId,
                "Failed to resolve accumulated depreciation account");

        for (PostingRequest.Line line : request.getLines()) {
            // Dr: Depreciation Expense
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(expenseAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            // Cr: Accumulated Depreciation
            JournalEntryLineRequest crLine = new JournalEntryLineRequest();
            crLine.setAccountId(accumulatedDepAccount.getAccountId());
            crLine.setDebitAmount(BigDecimal.ZERO);
            crLine.setCreditAmount(line.getAmount());
            populateDimensions(line, crLine);
            targetLines.add(crLine);
        }
    }

    private void generatePayrollRunLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        ChartOfAccount salaryExpenseAccount = fallbackOrThrow(AccountSection.PL_SALARIES, tenantId,
                "Failed to resolve salaries expense account");

        ChartOfAccount salariesPayableAccount = fallbackOrThrow(AccountSection.BS_SALARIES_PAYABLE, tenantId,
                "Failed to resolve salaries payable account");

        for (PostingRequest.Line line : request.getLines()) {
            // Dr: Salaries Expense
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(salaryExpenseAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            // Cr: Salaries Payable
            JournalEntryLineRequest crLine = new JournalEntryLineRequest();
            crLine.setAccountId(salariesPayableAccount.getAccountId());
            crLine.setDebitAmount(BigDecimal.ZERO);
            crLine.setCreditAmount(line.getAmount());
            populateDimensions(line, crLine);
            targetLines.add(crLine);
        }
    }

    private void generateSalaryPaymentLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        ChartOfAccount salariesPayableAccount = fallbackOrThrow(AccountSection.BS_SALARIES_PAYABLE, tenantId,
                "Failed to resolve salaries payable account");

        for (PostingRequest.Line line : request.getLines()) {
            // Dr: Salaries Payable
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(salariesPayableAccount.getAccountId());
            drLine.setDebitAmount(line.getAmount());
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            totalAmount = totalAmount.add(line.getAmount());
        }

        // Cr: Cash/Bank Account
        ChartOfAccount cashBankAccount = fallbackOrThrow(AccountSection.BS_CASH, tenantId,
                "Failed to resolve cash account for salary payment");

        JournalEntryLineRequest crLine = new JournalEntryLineRequest();
        crLine.setAccountId(cashBankAccount.getAccountId());
        crLine.setDebitAmount(BigDecimal.ZERO);
        crLine.setCreditAmount(totalAmount);
        targetLines.add(crLine);
    }

    private void generatePosSaleLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalSalesAmount = BigDecimal.ZERO;

        for (PostingRequest.Line line : request.getLines()) {
            // Sales/Revenue account lookup
            ChartOfAccount salesAccount;
            try {
                if (line.getItemId() != null) {
                    salesAccount = resolver.resolveItemAccount(line.getItemId(), "SALES", tenantId);
                } else {
                    salesAccount = resolver.resolveAccountBySection(AccountSection.PL_SALES_GOODS, tenantId);
                }
            } catch (Exception e) {
                salesAccount = fallbackOrThrow(AccountSection.PL_SALES_GOODS, tenantId,
                        "Failed to resolve Sales account: " + e.getMessage());
            }

            // Cr: Sales
            JournalEntryLineRequest crLine = new JournalEntryLineRequest();
            crLine.setAccountId(salesAccount.getAccountId());
            crLine.setDebitAmount(BigDecimal.ZERO);
            crLine.setCreditAmount(line.getAmount());
            populateDimensions(line, crLine);
            targetLines.add(crLine);

            totalSalesAmount = totalSalesAmount.add(line.getAmount());
        }

        // Dr: Cash/Bank
        ChartOfAccount cashBankAccount = fallbackOrThrow(AccountSection.BS_CASH, tenantId,
                "Failed to resolve cash account for POS Sales");

        JournalEntryLineRequest drLine = new JournalEntryLineRequest();
        drLine.setAccountId(cashBankAccount.getAccountId());
        drLine.setDebitAmount(totalSalesAmount);
        drLine.setCreditAmount(BigDecimal.ZERO);
        targetLines.add(drLine);
    }
}
