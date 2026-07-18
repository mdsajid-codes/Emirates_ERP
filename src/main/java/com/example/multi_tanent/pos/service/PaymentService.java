package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.PaymentRequest;
import com.example.multi_tanent.pos.entity.Payment;
import com.example.multi_tanent.pos.entity.Sale;
import com.example.multi_tanent.pos.repository.PaymentRepository;
import com.example.multi_tanent.pos.repository.SaleRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class PaymentService {

    private final SaleRepository saleRepository;
    private final PaymentRepository paymentRepository;
    private final TenantRepository tenantRepository;

    public PaymentService(SaleRepository saleRepository, PaymentRepository paymentRepository, TenantRepository tenantRepository) {
        this.saleRepository = saleRepository;
        this.paymentRepository = paymentRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    private Sale getSaleForCurrentTenant(Long saleId) {
        Tenant currentTenant = getCurrentTenant();
        return saleRepository.findByIdAndTenantId(saleId, currentTenant.getId())
                .orElseThrow(() -> new RuntimeException("Sale not found with id: " + saleId));
    }

    public Payment addPayment(Long saleId, PaymentRequest request) {
        Sale sale = getSaleForCurrentTenant(saleId);

        Payment payment = new Payment();
        payment.setSale(sale);
        payment.setMethod(request.getMethod());
        payment.setAmountCents(request.getAmountCents());
        payment.setReference(request.getReference());

        sale.getPayments().add(payment);
        recalculateSalePaymentStatus(sale);

        // We save the aggregate root (Sale), and the payment will be persisted due to cascade.
        saleRepository.save(sale);

        // The payment object now has an ID, so we can return it.
        return payment;
    }

    @Transactional(readOnly = true)
    public List<Payment> getAllPaymentsForSale(Long saleId) {
        Sale sale = getSaleForCurrentTenant(saleId);
        return sale.getPayments();
    }

    public void deletePayment(Long saleId, Long paymentId) {
        Sale sale = getSaleForCurrentTenant(saleId);
        boolean removed = sale.getPayments().removeIf(p -> p.getId().equals(paymentId));
        if (!removed) {
            throw new RuntimeException("Payment not found with id: " + paymentId + " for sale " + saleId);
        }
        recalculateSalePaymentStatus(sale);
        saleRepository.save(sale);
    }

    private void recalculateSalePaymentStatus(Sale sale) {
        long totalPaid = sale.getPayments().stream().mapToLong(Payment::getAmountCents).sum();

        if (totalPaid >= sale.getTotalCents()) {
            sale.setPaymentStatus("paid");
        } else if (totalPaid > 0) {
            sale.setPaymentStatus("partial");
        } else {
            sale.setPaymentStatus("unpaid");
        }
    }
}