package com.example.multi_tanent.accounts.service;

import com.example.multi_tanent.accounts.entity.AccCashFlowItem;
import com.example.multi_tanent.accounts.entity.AccCashFlowTransaction;
import com.example.multi_tanent.accounts.entity.AccPayment;
import com.example.multi_tanent.accounts.repository.AccCashFlowItemRepository;
import com.example.multi_tanent.accounts.repository.AccCashFlowTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccCashFlowRecorder {

    private final AccCashFlowItemRepository cashFlowItemRepository;
    private final AccCashFlowTransactionRepository cashFlowTransactionRepository;

    @Transactional
    public void recordCashFlow(AccPayment payment) {
        if (payment.getPaymentMethod() == com.example.multi_tanent.accounts.entity.enums.PaymentMethod.PDC ||
            payment.getPaymentMethod() == com.example.multi_tanent.accounts.entity.enums.PaymentMethod.MUTUAL_SETTLEMENT) {
            // PDCs don't immediately affect cash flow until cleared. Mutual settlements never do.
            return;
        }

        List<AccCashFlowItem> items = cashFlowItemRepository.findByTenantIdOrderByDisplayOrderAsc(payment.getTenantId());
        if (items.isEmpty()) {
            items = cashFlowItemRepository.findByTenantIdOrderByDisplayOrderAsc("DEFAULT");
        }

        if (items.isEmpty()) {
            return; // No cash flow items configured
        }

        AccCashFlowItem defaultItem;
        if (payment.getPaymentType() == com.example.multi_tanent.accounts.entity.enums.PaymentType.AR_RECEIPT || 
            payment.getPaymentType() == com.example.multi_tanent.accounts.entity.enums.PaymentType.PREPAYMENT_IN) {
            defaultItem = items.stream().filter(AccCashFlowItem::getIsInflow).findFirst().orElse(items.get(0));
        } else {
            defaultItem = items.stream().filter(i -> !i.getIsInflow()).findFirst().orElse(items.get(0));
        }

        AccCashFlowTransaction tx = AccCashFlowTransaction.builder()
                .cashFlowItem(defaultItem)
                .payment(payment)
                .journalEntry(payment.getJournalEntry())
                .amount(payment.getAmount())
                .transactionDate(payment.getPaymentDate())
                .isInflow(defaultItem.getIsInflow())
                .description("Payment " + payment.getPaymentNumber() + " - " + payment.getPartnerType() + " " + payment.getPartnerId())
                .tenantId(payment.getTenantId())
                .build();

        cashFlowTransactionRepository.save(tx);
    }
}
