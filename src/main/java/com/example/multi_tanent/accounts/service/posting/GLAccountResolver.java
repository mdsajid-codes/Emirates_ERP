package com.example.multi_tanent.accounts.service.posting;

import com.example.multi_tanent.accounts.entity.ItemGLAccount;
import com.example.multi_tanent.accounts.entity.PartyGLAccount;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.accounts.entity.enums.PartyType;
import com.example.multi_tanent.accounts.repository.ItemGLAccountRepository;
import com.example.multi_tanent.accounts.repository.PartyGLAccountRepository;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class GLAccountResolver {

    private final ItemGLAccountRepository itemGLAccountRepository;
    private final PartyGLAccountRepository partyGLAccountRepository;
    private final ChartOfAccountRepository coaRepository;

    public ChartOfAccount resolveItemAccount(Long itemId, String transactionType, Long tenantId) {
        if (itemId == null) {
            throw new IllegalArgumentException("Cannot resolve item account: itemId is null");
        }
        ItemGLAccount mapping = itemGLAccountRepository.findByItemIdAndTenant(itemId, tenantId)
                .orElseThrow(() -> new NoSuchElementException("No GL Account mapping found for item ID: " + itemId));

        ChartOfAccount account = null;
        switch (transactionType.toUpperCase()) {
            case "PURCHASES":
                account = mapping.getGlAccount();
                break;
            case "SALES":
                account = mapping.getSalesRevenueAccount();
                break;
            case "COS":
            case "COGS":
                account = mapping.getCostOfGoodsSoldAccount();
                break;
            case "INVENTORY":
            case "CONSIGNMENT":
                account = mapping.getGoodsOnConsignmentAccount();
                break;
            case "DEFERRED_EXPENSE":
                account = mapping.getDeferredExpensesAccount();
                break;
            case "OUTPUT_VAT":
                account = mapping.getOutputVatAccount();
                break;
            case "INPUT_VAT":
                account = mapping.getInputVatAccount();
                break;
            case "DISCOUNT":
                account = mapping.getTradeDiscountsAccount();
                break;
            default:
                throw new IllegalArgumentException("Unsupported item transaction type: " + transactionType);
        }

        if (account == null) {
            throw new NoSuchElementException("GL account for transaction type '" + transactionType + "' is not configured for item ID: " + itemId);
        }
        return account;
    }

    public ChartOfAccount resolvePartyAccount(Long partyId, PartyType partyType, String accountType, Long tenantId) {
        if (partyId == null) {
            throw new IllegalArgumentException("Cannot resolve party account: partyId is null");
        }
        PartyGLAccount mapping = partyGLAccountRepository.findByPartyTypeAndPartyIdAndTenant(partyType, partyId, tenantId)
                .orElseThrow(() -> new NoSuchElementException("No GL Account mapping found for party type: " + partyType + " ID: " + partyId));

        ChartOfAccount account = null;
        switch (accountType.toUpperCase()) {
            case "AR":
            case "ACCOUNTS_RECEIVABLE":
                account = mapping.getAccountsReceivable();
                break;
            case "AP":
            case "ACCOUNTS_PAYABLE":
                account = mapping.getAccountsPayable();
                break;
            case "ADVANCES_RECEIVED":
                account = mapping.getAdvancesReceived();
                break;
            case "ADVANCES_PAID":
                account = mapping.getAdvancesPaid();
                break;
            case "PDCS_RECEIVED":
                account = mapping.getPdcsReceived();
                break;
            case "PDCS_ISSUED":
                account = mapping.getPdcsIssued();
                break;
            case "CONTRACT_ASSETS":
                account = mapping.getContractAssets();
                break;
            case "RETENTION_RECEIVABLES":
                account = mapping.getRetentionReceivables();
                break;
            case "RETENTION_PAYABLES":
                account = mapping.getRetentionPayables();
                break;
            case "RETENTION_OUTPUT_VAT":
                account = mapping.getRetentionOutputVat();
                break;
            case "RETENTION_INPUT_VAT":
                account = mapping.getRetentionInputVat();
                break;
            case "UNBILLED_PURCHASES":
                account = mapping.getUnbilledPurchases();
                break;
            case "ADVANCE_TO_RECEIVE":
                account = mapping.getAdvanceToReceive();
                break;
            default:
                throw new IllegalArgumentException("Unsupported party account type: " + accountType);
        }

        if (account == null) {
            throw new NoSuchElementException("GL account for type '" + accountType + "' is not configured for party type " + partyType + " ID: " + partyId);
        }
        return account;
    }

    public ChartOfAccount resolveAccountBySection(AccountSection section, Long tenantId) {
        List<ChartOfAccount> accounts = coaRepository.findBySectionAndTenant(section, tenantId);
        if (accounts.isEmpty()) {
            throw new NoSuchElementException("No active Chart of Account found for section: " + section);
        }

        List<ChartOfAccount> activeAccounts = accounts.stream()
                .filter(ChartOfAccount::getIsActive)
                .toList();

        if (activeAccounts.isEmpty()) {
            throw new NoSuchElementException("No active Chart of Account found for section: " + section);
        }

        // 1. Priority matching for Cash at Counter / Till Cash
        if (section == AccountSection.BS_CASH) {
            return activeAccounts.stream()
                    .filter(a -> (a.getDescription() != null && (a.getDescription().toLowerCase().contains("cash") ||
                                 a.getDescription().toLowerCase().contains("till"))) ||
                                 (a.getAccountCode() != null && a.getAccountCode().startsWith("101")))
                    .findFirst()
                    .orElse(activeAccounts.get(0));
        }

        // 2. Priority matching for Output VAT Payable (exclude prepayments)
        if (section == AccountSection.BS_VAT_PAYABLE) {
            return activeAccounts.stream()
                    .filter(a -> {
                        String desc = a.getDescription() != null ? a.getDescription().toLowerCase() : "";
                        String code = a.getAccountCode() != null ? a.getAccountCode() : "";
                        return (code.startsWith("20301") || desc.contains("output vat") || desc.contains("vat payable"))
                                && !desc.contains("prepayment");
                    })
                    .findFirst()
                    .orElseGet(() -> activeAccounts.stream()
                            .filter(a -> {
                                String desc = a.getDescription() != null ? a.getDescription().toLowerCase() : "";
                                return !desc.contains("prepayment");
                            })
                            .findFirst()
                            .orElse(activeAccounts.get(0)));
        }

        return activeAccounts.get(0);
    }
}
