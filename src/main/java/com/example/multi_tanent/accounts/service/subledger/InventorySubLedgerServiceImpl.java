package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.InventoryMovementRow;
import com.example.multi_tanent.accounts.dto.subledger.InventorySubLedgerSummary;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.repository.ItemGLAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.SubLedgerRepository;
import com.example.multi_tanent.pos.repository.ProductRepository;
import com.example.multi_tanent.pos.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(value = "tenantTx", readOnly = true)
public class InventorySubLedgerServiceImpl implements InventorySubLedgerService {

    private final SubLedgerRepository subLedgerRepository;
    private final ItemGLAccountRepository itemGLAccountRepository;
    private final ProductRepository productRepository;

    private List<Long> getInventoryAccountIds(Long tenantId) {
        return itemGLAccountRepository.findAllByTenant(tenantId).stream()
                .filter(i -> i.getGlAccount() != null)
                .map(i -> i.getGlAccount().getAccountId())
                .distinct()
                .collect(Collectors.toList());
    }

    private String getItemName(Long itemId, Long tenantId) {
        if (itemId == null) return "Unknown Item";
        return productRepository.findByIdAndTenantId(itemId, tenantId)
                .map(Product::getName)
                .orElse("Item #" + itemId);
    }

    private String getItemSku(Long itemId, Long tenantId) {
        if (itemId == null) return "";
        return productRepository.findByIdAndTenantId(itemId, tenantId)
                .map(Product::getSku)
                .orElse("");
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        return BigDecimal.valueOf(((Number) val).doubleValue());
    }

    @Override
    public List<InventorySubLedgerSummary> getInventorySummary(Long tenantId) {
        List<Long> accountIds = getInventoryAccountIds(tenantId);
        if (accountIds.isEmpty()) return new ArrayList<>();

        List<Object[]> results = subLedgerRepository.getInventoryItemBalances(tenantId, accountIds);
        return results.stream().map(row -> {
            Long itemId = (Long) row[0];
            BigDecimal qtyIn = toBigDecimal(row[1]);
            BigDecimal qtyOut = toBigDecimal(row[2]);
            BigDecimal totalDebit = toBigDecimal(row[3]);
            BigDecimal totalCredit = toBigDecimal(row[4]);

            BigDecimal netQty = qtyIn.subtract(qtyOut);
            BigDecimal netValue = totalDebit.subtract(totalCredit);

            return InventorySubLedgerSummary.builder()
                    .itemId(itemId)
                    .itemName(getItemName(itemId, tenantId))
                    .itemSku(getItemSku(itemId, tenantId))
                    .totalQtyIn(qtyIn)
                    .totalQtyOut(qtyOut)
                    .netQty(netQty)
                    .totalDebit(totalDebit)
                    .totalCredit(totalCredit)
                    .netValue(netValue)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<InventoryMovementRow> getInventoryMovement(Long itemId, Long tenantId, LocalDate from, LocalDate to) {
        List<Long> accountIds = getInventoryAccountIds(tenantId);
        if (accountIds.isEmpty()) return new ArrayList<>();

        List<Object[]> results = subLedgerRepository.getInventoryMovementRows(tenantId, accountIds, itemId);
        List<InventoryMovementRow> movement = new ArrayList<>();
        BigDecimal runningQty = BigDecimal.ZERO;
        BigDecimal runningBalance = BigDecimal.ZERO;

        for (Object[] row : results) {
            JournalEntryLine jel = (JournalEntryLine) row[0];
            JournalEntry je = (JournalEntry) row[1];

            BigDecimal debit = toBigDecimal(jel.getDebitAmount());
            BigDecimal credit = toBigDecimal(jel.getCreditAmount());
            BigDecimal lineQty = toBigDecimal(jel.getQuantity());

            BigDecimal qtyIn = debit.compareTo(BigDecimal.ZERO) > 0 ? lineQty : BigDecimal.ZERO;
            BigDecimal qtyOut = credit.compareTo(BigDecimal.ZERO) > 0 ? lineQty : BigDecimal.ZERO;

            runningQty = runningQty.add(qtyIn).subtract(qtyOut);
            runningBalance = runningBalance.add(debit).subtract(credit);

            if ((from != null && je.getEntryDate().isBefore(from)) ||
                (to != null && je.getEntryDate().isAfter(to))) {
                continue;
            }

            movement.add(InventoryMovementRow.builder()
                    .journalEntryId(je.getJournalEntryId())
                    .entryNumber(je.getEntryNumber())
                    .entryDate(je.getEntryDate())
                    .documentType(je.getDocumentType().name())
                    .referenceNumber(je.getReferenceNumber())
                    .description(jel.getDescription() != null ? jel.getDescription() : je.getDescription())
                    .qtyIn(qtyIn)
                    .qtyOut(qtyOut)
                    .runningQty(runningQty)
                    .debitAmount(debit)
                    .creditAmount(credit)
                    .runningBalance(runningBalance)
                    .build());
        }

        return movement;
    }

    @Override
    public List<InventorySubLedgerSummary> getStockValuation(Long tenantId) {
        // Return same summary as valuation, filtering out zero stock items is optional or can be done on front-end
        return getInventorySummary(tenantId);
    }
}
