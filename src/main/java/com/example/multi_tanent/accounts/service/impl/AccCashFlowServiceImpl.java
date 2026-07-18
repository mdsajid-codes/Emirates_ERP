package com.example.multi_tanent.accounts.service.impl;

import com.example.multi_tanent.accounts.dto.cashflow.*;
import com.example.multi_tanent.accounts.entity.AccCashFlowItem;
import com.example.multi_tanent.accounts.entity.AccCashFlowTransaction;
import com.example.multi_tanent.accounts.entity.enums.CashFlowCategory;
import com.example.multi_tanent.accounts.repository.AccCashFlowItemRepository;
import com.example.multi_tanent.accounts.repository.AccCashFlowTransactionRepository;
import com.example.multi_tanent.accounts.service.AccCashFlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccCashFlowServiceImpl implements AccCashFlowService {

    private final AccCashFlowItemRepository itemRepository;
    private final AccCashFlowTransactionRepository transactionRepository;

    @Override
    public CashFlowItemResponse createItem(CashFlowItemRequest request, String tenantId) {
        AccCashFlowItem item = AccCashFlowItem.builder()
                .name(request.getName())
                .category(request.getCategory())
                .displayOrder(request.getDisplayOrder())
                .isInflow(request.getIsInflow())
                .tenantId(tenantId)
                .build();
        item = itemRepository.save(item);
        return mapToResponse(item);
    }

    @Override
    public List<CashFlowItemResponse> getAllItems(String tenantId) {
        return itemRepository.findAll().stream()
                .filter(i -> tenantId.equals(i.getTenantId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CashFlowTransactionResponse createTransaction(CashFlowTransactionRequest request, String tenantId) {
        AccCashFlowItem item = itemRepository.findById(request.getCashFlowItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        AccCashFlowTransaction tx = AccCashFlowTransaction.builder()
                .cashFlowItem(item)
                // payment and journal entry can be looked up or passed directly in full impl
                .amount(request.getAmount())
                .transactionDate(request.getTransactionDate())
                .isInflow(request.getIsInflow())
                .description(request.getDescription())
                .tenantId(tenantId)
                .build();

        tx = transactionRepository.save(tx);
        return mapToResponse(tx);
    }

    @Override
    public List<CashFlowTransactionResponse> getAllTransactions(String tenantId) {
        return transactionRepository.findAll().stream()
                .filter(t -> tenantId.equals(t.getTenantId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CashFlowStatementResponse generateCashFlowStatement(LocalDate from, LocalDate to, String tenantId) {
        List<AccCashFlowTransaction> txs = transactionRepository.findAll().stream()
                .filter(t -> tenantId.equals(t.getTenantId()))
                .filter(t -> !t.getTransactionDate().isBefore(from) && !t.getTransactionDate().isAfter(to))
                .collect(Collectors.toList());

        CashFlowStatementResponse res = new CashFlowStatementResponse();
        res.setFromDate(from);
        res.setToDate(to);

        res.setOperatingActivities(aggregateByCategory(txs, CashFlowCategory.OPERATING));
        res.setInvestingActivities(aggregateByCategory(txs, CashFlowCategory.INVESTING));
        res.setFinancingActivities(aggregateByCategory(txs, CashFlowCategory.FINANCING));

        res.setNetCashFromOperating(sumActivities(res.getOperatingActivities()));
        res.setNetCashFromInvesting(sumActivities(res.getInvestingActivities()));
        res.setNetCashFromFinancing(sumActivities(res.getFinancingActivities()));

        res.setNetChangeInCash(res.getNetCashFromOperating().add(res.getNetCashFromInvesting()).add(res.getNetCashFromFinancing()));
        
        // Mock opening/closing
        res.setOpeningCashBalance(BigDecimal.ZERO);
        res.setClosingCashBalance(res.getNetChangeInCash());

        return res;
    }

    private List<CashFlowStatementResponse.CashFlowSectionItem> aggregateByCategory(List<AccCashFlowTransaction> txs, CashFlowCategory category) {
        Map<String, BigDecimal> grouped = txs.stream()
                .filter(t -> t.getCashFlowItem().getCategory() == category)
                .collect(Collectors.toMap(
                        t -> t.getCashFlowItem().getName(),
                        t -> t.getIsInflow() ? t.getAmount() : t.getAmount().negate(),
                        BigDecimal::add
                ));

        return grouped.entrySet().stream()
                .map(e -> {
                    CashFlowStatementResponse.CashFlowSectionItem item = new CashFlowStatementResponse.CashFlowSectionItem();
                    item.setItemName(e.getKey());
                    item.setAmount(e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
    }

    private BigDecimal sumActivities(List<CashFlowStatementResponse.CashFlowSectionItem> items) {
        return items.stream()
                .map(CashFlowStatementResponse.CashFlowSectionItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private CashFlowItemResponse mapToResponse(AccCashFlowItem item) {
        CashFlowItemResponse res = new CashFlowItemResponse();
        res.setId(item.getId());
        res.setName(item.getName());
        res.setCategory(item.getCategory());
        res.setDisplayOrder(item.getDisplayOrder());
        res.setIsInflow(item.getIsInflow());
        res.setTenantId(item.getTenantId());
        return res;
    }

    private CashFlowTransactionResponse mapToResponse(AccCashFlowTransaction tx) {
        CashFlowTransactionResponse res = new CashFlowTransactionResponse();
        res.setId(tx.getId());
        res.setCashFlowItemId(tx.getCashFlowItem().getId());
        res.setCashFlowItemName(tx.getCashFlowItem().getName());
        res.setPaymentId(tx.getPayment() != null ? tx.getPayment().getId() : null);
        res.setJournalEntryId(tx.getJournalEntry() != null ? tx.getJournalEntry().getJournalEntryId() : null);
        res.setAmount(tx.getAmount());
        res.setTransactionDate(tx.getTransactionDate());
        res.setIsInflow(tx.getIsInflow());
        res.setDescription(tx.getDescription());
        res.setTenantId(tx.getTenantId());
        return res;
    }
}
