package com.example.multi_tanent.sales.listener;

import com.example.multi_tanent.accounts.event.PaymentAllocatedEvent;
import com.example.multi_tanent.sales.entity.SalesInvoice;
import com.example.multi_tanent.sales.enums.SalesStatus;
import com.example.multi_tanent.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class SalesInvoicePaymentListener {

    private final SalesInvoiceRepository salesInvoiceRepository;

    @EventListener
    @Transactional
    public void handlePaymentAllocatedEvent(PaymentAllocatedEvent event) {
        if (!"CUSTOMER".equals(event.getPartnerType())) {
            return;
        }

        Long invoiceId = event.getInvoiceId();
        Optional<SalesInvoice> optionalInvoice = salesInvoiceRepository.findById(invoiceId);
        
        if (optionalInvoice.isPresent()) {
            SalesInvoice invoice = optionalInvoice.get();
            // Validate tenant
            if (!invoice.getTenant().getTenantId().equals(event.getTenantId())) {
                log.warn("Tenant mismatch for SalesInvoice {}: expected {}, got {}", invoiceId, event.getTenantId(), invoice.getTenant().getTenantId());
                return;
            }

            BigDecimal currentReceived = invoice.getAmountReceived() != null ? invoice.getAmountReceived() : BigDecimal.ZERO;
            BigDecimal newReceived = currentReceived.add(event.getAllocatedAmount());
            invoice.setAmountReceived(newReceived);

            BigDecimal netTotal = invoice.getNetTotal() != null ? invoice.getNetTotal() : BigDecimal.ZERO;
            BigDecimal newBalanceDue = netTotal.subtract(newReceived);
            if (newBalanceDue.compareTo(BigDecimal.ZERO) < 0) {
                newBalanceDue = BigDecimal.ZERO;
            }
            invoice.setBalanceDue(newBalanceDue);

            if (newBalanceDue.compareTo(BigDecimal.ZERO) == 0) {
                invoice.setStatus(SalesStatus.PAID);
            } else if (newReceived.compareTo(BigDecimal.ZERO) > 0) {
                invoice.setStatus(SalesStatus.PARTIALLY_PAID);
            }

            salesInvoiceRepository.save(invoice);
            log.info("Updated SalesInvoice {} due to payment allocation: newReceived={}, newBalanceDue={}, status={}", 
                invoiceId, newReceived, newBalanceDue, invoice.getStatus());
        } else {
            // Note: invoiceId might belong to RentalInvoice or ProformaInvoice.
            // Further logic could be added to check those repositories.
            log.debug("SalesInvoice not found for ID {}", invoiceId);
        }
    }
}
