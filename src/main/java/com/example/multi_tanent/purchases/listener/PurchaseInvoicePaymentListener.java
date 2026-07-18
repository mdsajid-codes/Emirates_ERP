package com.example.multi_tanent.purchases.listener;

import com.example.multi_tanent.accounts.event.PaymentAllocatedEvent;
import com.example.multi_tanent.purchases.entity.PurPurchaseInvoice;
import com.example.multi_tanent.purchases.repository.PurPurchaseInvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class PurchaseInvoicePaymentListener {

    private final PurPurchaseInvoiceRepository purchaseInvoiceRepository;

    @EventListener
    @Transactional
    public void handlePaymentAllocatedEvent(PaymentAllocatedEvent event) {
        if (!"SUPPLIER".equals(event.getPartnerType())) {
            return;
        }

        Long invoiceId = event.getInvoiceId();
        Optional<PurPurchaseInvoice> optionalInvoice = purchaseInvoiceRepository.findById(invoiceId);
        
        if (optionalInvoice.isPresent()) {
            PurPurchaseInvoice invoice = optionalInvoice.get();
            // Validate tenant
            if (!invoice.getTenant().getTenantId().equals(event.getTenantId())) {
                log.warn("Tenant mismatch for PurPurchaseInvoice {}: expected {}, got {}", invoiceId, event.getTenantId(), invoice.getTenant().getTenantId());
                return;
            }

            // Note: PurPurchaseInvoice currently does not have 'amountPaid' or 'status' fields like SalesInvoice does.
            // If those fields are added in the future, update them here just like in SalesInvoicePaymentListener.
            
            log.info("Received PaymentAllocatedEvent for PurPurchaseInvoice {}: allocatedAmount={}", 
                invoiceId, event.getAllocatedAmount());
        } else {
            log.debug("PurPurchaseInvoice not found for ID {}", invoiceId);
        }
    }
}
