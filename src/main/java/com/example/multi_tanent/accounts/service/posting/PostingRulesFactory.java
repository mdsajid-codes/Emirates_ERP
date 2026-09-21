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
            case POS_COGS:
                generatePosCogsLines(request, tenantId, generatedLines);
                break;
            case POS_REFUND:
                generatePosRefundLines(request, tenantId, generatedLines);
                break;
            case POS_SHIFT_RECONCILIATION:
                generatePosShiftReconciliationLines(request, tenantId, generatedLines);
                break;
            case POS_CARD_SETTLEMENT:
                generatePosCardSettlementLines(request, tenantId, generatedLines);
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
        BigDecimal totalVatAmount = BigDecimal.ZERO;

        for (PostingRequest.Line line : request.getLines()) {
            // 1. Sales/Revenue account lookup
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

            // Cr: Sales (Subtotal)
            JournalEntryLineRequest crSalesLine = new JournalEntryLineRequest();
            crSalesLine.setAccountId(salesAccount.getAccountId());
            crSalesLine.setDebitAmount(BigDecimal.ZERO);
            crSalesLine.setCreditAmount(line.getAmount());
            populateDimensions(line, crSalesLine);
            if (crSalesLine.getDimCompanyId() == null && request.getCompanyId() != null) {
                crSalesLine.setDimCompanyId(request.getCompanyId());
            }
            targetLines.add(crSalesLine);

            totalSalesAmount = totalSalesAmount.add(line.getAmount());

            // 2. Output VAT Payable lookup & Line creation (if line has VAT)
            if (line.getTaxAmount() != null && line.getTaxAmount().compareTo(BigDecimal.ZERO) > 0) {
                ChartOfAccount vatAccount;
                try {
                    if (line.getItemId() != null) {
                        vatAccount = resolver.resolveItemAccount(line.getItemId(), "OUTPUT_VAT", tenantId);
                    } else {
                        vatAccount = resolver.resolveAccountBySection(AccountSection.BS_VAT_PAYABLE, tenantId);
                    }
                } catch (Exception e) {
                    vatAccount = fallbackOrThrow(AccountSection.BS_VAT_PAYABLE, tenantId,
                            "Failed to resolve Output VAT account: " + e.getMessage());
                }

                JournalEntryLineRequest crVatLine = new JournalEntryLineRequest();
                crVatLine.setAccountId(vatAccount.getAccountId());
                crVatLine.setDebitAmount(BigDecimal.ZERO);
                crVatLine.setCreditAmount(line.getTaxAmount());
                populateDimensions(line, crVatLine);
                if (crVatLine.getDimCompanyId() == null && request.getCompanyId() != null) {
                    crVatLine.setDimCompanyId(request.getCompanyId());
                }
                targetLines.add(crVatLine);

                totalVatAmount = totalVatAmount.add(line.getTaxAmount());
            }
        }

        BigDecimal netTotalAmount = totalSalesAmount.add(totalVatAmount);

        // 3. Dr: Cash/Bank (BS_CASH) for cash/card/wallet; BS_TRADE_RECEIVABLES for credit/account sales
        String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod().toLowerCase() : "cash";
        AccountSection targetSection;
        if (paymentMethod.contains("credit") || paymentMethod.contains("receivable") || paymentMethod.contains("ar")
                || paymentMethod.contains("customer") || paymentMethod.contains("on_account") || paymentMethod.contains("account")) {
            targetSection = AccountSection.BS_TRADE_RECEIVABLES;
        } else {
            // cash, card, wallet, terminal all debit BS_CASH (Cash/Bank on hand)
            targetSection = AccountSection.BS_CASH;
        }

        ChartOfAccount debitAccount;
        if (targetSection == AccountSection.BS_TRADE_RECEIVABLES && request.getCompanyId() != null) {
            try {
                debitAccount = resolver.resolvePartyAccount(request.getCompanyId(), PartyType.CUSTOMER, "AR", tenantId);
            } catch (Exception e) {
                debitAccount = fallbackOrThrow(targetSection, tenantId,
                        "Failed to resolve party AR account for POS Sales: " + e.getMessage());
            }
        } else {
            debitAccount = fallbackOrThrow(targetSection, tenantId,
                    "Failed to resolve asset account for POS Sales (" + paymentMethod + ")");
        }

        JournalEntryLineRequest drLine = new JournalEntryLineRequest();
        drLine.setAccountId(debitAccount.getAccountId());
        drLine.setDebitAmount(netTotalAmount);
        drLine.setCreditAmount(BigDecimal.ZERO);
        if (request.getCompanyId() != null) {
            drLine.setDimCompanyId(request.getCompanyId());
        }
        targetLines.add(drLine);
    }

    private void generatePosCogsLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalCogs = BigDecimal.ZERO;

        for (PostingRequest.Line line : request.getLines()) {
            BigDecimal cogsAmount = line.getCogsAmount() != null ? line.getCogsAmount() : line.getAmount();
            if (cogsAmount == null || cogsAmount.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            ChartOfAccount cogsAccount;
            try {
                if (line.getItemId() != null) {
                    cogsAccount = resolver.resolveItemAccount(line.getItemId(), "COS", tenantId);
                } else {
                    cogsAccount = resolver.resolveAccountBySection(AccountSection.PL_COS_GOODS, tenantId);
                }
            } catch (Exception e) {
                cogsAccount = fallbackOrThrow(AccountSection.PL_COS_GOODS, tenantId,
                        "Failed to resolve COGS account: " + e.getMessage());
            }

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

            // Dr: COGS Expense
            JournalEntryLineRequest drLine = new JournalEntryLineRequest();
            drLine.setAccountId(cogsAccount.getAccountId());
            drLine.setDebitAmount(cogsAmount);
            drLine.setCreditAmount(BigDecimal.ZERO);
            populateDimensions(line, drLine);
            targetLines.add(drLine);

            // Cr: Inventory Asset
            JournalEntryLineRequest crLine = new JournalEntryLineRequest();
            crLine.setAccountId(inventoryAccount.getAccountId());
            crLine.setDebitAmount(BigDecimal.ZERO);
            crLine.setCreditAmount(cogsAmount);
            populateDimensions(line, crLine);
            targetLines.add(crLine);

            totalCogs = totalCogs.add(cogsAmount);
        }
    }

    private void generatePosRefundLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal totalSalesAmount = BigDecimal.ZERO;
        BigDecimal totalVatAmount = BigDecimal.ZERO;
        BigDecimal totalCogsAmount = BigDecimal.ZERO;

        if (request.getLines() != null) {
            for (PostingRequest.Line line : request.getLines()) {
                BigDecimal lineAmount = line.getAmount() != null ? line.getAmount() : BigDecimal.ZERO;
                BigDecimal lineTax = line.getTaxAmount() != null ? line.getTaxAmount() : BigDecimal.ZERO;
                BigDecimal lineCogs = line.getCogsAmount() != null ? line.getCogsAmount() : BigDecimal.ZERO;

                totalSalesAmount = totalSalesAmount.add(lineAmount);
                totalVatAmount = totalVatAmount.add(lineTax);
                totalCogsAmount = totalCogsAmount.add(lineCogs);
            }
        }

        BigDecimal grossRefund = totalSalesAmount.add(totalVatAmount);

        ChartOfAccount salesAccount = fallbackOrThrow(AccountSection.PL_SALES_GOODS, tenantId, "Sales Goods Account");
        ChartOfAccount vatAccount = fallbackOrThrow(AccountSection.BS_VAT_PAYABLE, tenantId, "VAT Payable Account");
        ChartOfAccount cashAccount = fallbackOrThrow(AccountSection.BS_CASH, tenantId, "Cash Account");

        // Dr: Sales Revenue (reduce sales)
        JournalEntryLineRequest drSales = new JournalEntryLineRequest();
        drSales.setAccountId(salesAccount.getAccountId());
        drSales.setDebitAmount(totalSalesAmount);
        drSales.setCreditAmount(BigDecimal.ZERO);
        targetLines.add(drSales);

        // Dr: VAT Payable (reduce tax liability)
        if (totalVatAmount.compareTo(BigDecimal.ZERO) > 0) {
            JournalEntryLineRequest drVat = new JournalEntryLineRequest();
            drVat.setAccountId(vatAccount.getAccountId());
            drVat.setDebitAmount(totalVatAmount);
            drVat.setCreditAmount(BigDecimal.ZERO);
            targetLines.add(drVat);
        }

        // Cr: Cash Refund Out
        JournalEntryLineRequest crCash = new JournalEntryLineRequest();
        crCash.setAccountId(cashAccount.getAccountId());
        crCash.setDebitAmount(BigDecimal.ZERO);
        crCash.setCreditAmount(grossRefund);
        targetLines.add(crCash);

        // Restock COGS reversal if provided
        if (totalCogsAmount.compareTo(BigDecimal.ZERO) > 0) {
            ChartOfAccount inventoryAccount = fallbackOrThrow(AccountSection.BS_INVENTORIES, tenantId, "Inventory Account");
            ChartOfAccount cogsAccount = fallbackOrThrow(AccountSection.PL_COS_GOODS, tenantId, "COGS Account");

            JournalEntryLineRequest drInv = new JournalEntryLineRequest();
            drInv.setAccountId(inventoryAccount.getAccountId());
            drInv.setDebitAmount(totalCogsAmount);
            drInv.setCreditAmount(BigDecimal.ZERO);
            targetLines.add(drInv);

            JournalEntryLineRequest crCogs = new JournalEntryLineRequest();
            crCogs.setAccountId(cogsAccount.getAccountId());
            crCogs.setDebitAmount(BigDecimal.ZERO);
            crCogs.setCreditAmount(totalCogsAmount);
            targetLines.add(crCogs);
        }
    }

    private void generatePosShiftReconciliationLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal variance = BigDecimal.ZERO;
        if (request.getLines() != null && !request.getLines().isEmpty()) {
            variance = request.getLines().get(0).getAmount() != null ? request.getLines().get(0).getAmount() : BigDecimal.ZERO;
        }

        if (variance.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        ChartOfAccount cashAccount = fallbackOrThrow(AccountSection.BS_CASH, tenantId, "Cash Account");
        ChartOfAccount expenseAccount = fallbackOrThrow(AccountSection.PL_COS_GOODS, tenantId, "Expense Account for Shift Variance");

        // Dr: Cash Variance Expense
        JournalEntryLineRequest drLine = new JournalEntryLineRequest();
        drLine.setAccountId(expenseAccount.getAccountId());
        drLine.setDebitAmount(variance);
        drLine.setCreditAmount(BigDecimal.ZERO);
        targetLines.add(drLine);

        // Cr: Cash Asset
        JournalEntryLineRequest crLine = new JournalEntryLineRequest();
        crLine.setAccountId(cashAccount.getAccountId());
        crLine.setDebitAmount(BigDecimal.ZERO);
        crLine.setCreditAmount(variance);
        targetLines.add(crLine);
    }

    private void generatePosCardSettlementLines(PostingRequest request, Long tenantId, List<JournalEntryLineRequest> targetLines) {
        BigDecimal gross = BigDecimal.ZERO;
        BigDecimal fee = BigDecimal.ZERO;
        if (request.getLines() != null && !request.getLines().isEmpty()) {
            PostingRequest.Line line = request.getLines().get(0);
            gross = line.getAmount() != null ? line.getAmount() : BigDecimal.ZERO;
            fee = line.getCogsAmount() != null ? line.getCogsAmount() : BigDecimal.ZERO;
        }

        BigDecimal net = gross.subtract(fee);

        ChartOfAccount bankAccount = fallbackOrThrow(AccountSection.BS_CASH, tenantId, "Bank Account");
        ChartOfAccount feeAccount = fallbackOrThrow(AccountSection.PL_COS_GOODS, tenantId, "Bank Fee Account");
        ChartOfAccount clearingAccount = fallbackOrThrow(AccountSection.BS_TRADE_RECEIVABLES, tenantId, "Terminal Clearing Account");

        // Dr: Bank Account (Net received)
        JournalEntryLineRequest drBank = new JournalEntryLineRequest();
        drBank.setAccountId(bankAccount.getAccountId());
        drBank.setDebitAmount(net);
        drBank.setCreditAmount(BigDecimal.ZERO);
        targetLines.add(drBank);

        // Dr: Merchant Processing Fee Expense
        if (fee.compareTo(BigDecimal.ZERO) > 0) {
            JournalEntryLineRequest drFee = new JournalEntryLineRequest();
            drFee.setAccountId(feeAccount.getAccountId());
            drFee.setDebitAmount(fee);
            drFee.setCreditAmount(BigDecimal.ZERO);
            targetLines.add(drFee);
        }

        // Cr: Terminal Clearing Asset
        JournalEntryLineRequest crClearing = new JournalEntryLineRequest();
        crClearing.setAccountId(clearingAccount.getAccountId());
        crClearing.setDebitAmount(BigDecimal.ZERO);
        crClearing.setCreditAmount(gross);
        targetLines.add(crClearing);
    }
}
