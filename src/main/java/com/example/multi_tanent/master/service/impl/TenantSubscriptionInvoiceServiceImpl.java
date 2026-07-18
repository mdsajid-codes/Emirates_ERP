package com.example.multi_tanent.master.service.impl;

import com.example.multi_tanent.master.dto.TenantSubscriptionInvoiceRequest;
import com.example.multi_tanent.master.dto.TenantSubscriptionInvoiceResponse;
import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.entity.TenantSubscriptionInvoice;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.example.multi_tanent.master.repository.TenantSubscriptionInvoiceRepository;
import com.example.multi_tanent.master.service.TenantSubscriptionInvoiceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class TenantSubscriptionInvoiceServiceImpl implements TenantSubscriptionInvoiceService {

    private final TenantSubscriptionInvoiceRepository repository;
    private final MasterTenantRepository masterTenantRepository;

    @Override
    public TenantSubscriptionInvoiceResponse createInvoice(Long masterTenantId,
            TenantSubscriptionInvoiceRequest request) {
        MasterTenant masterTenant = masterTenantRepository.findById(masterTenantId)
                .orElseThrow(() -> new EntityNotFoundException("MasterTenant not found with id: " + masterTenantId));

        TenantSubscriptionInvoice invoice = new TenantSubscriptionInvoice();
        invoice.setMasterTenant(masterTenant);
        String invoiceNumber = request.getInvoiceNumber();
        if (invoiceNumber == null || invoiceNumber.trim().isEmpty()) {
            invoiceNumber = generateInvoiceNumber();
        }
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setGeneratedDate(LocalDateTime.now());
        invoice.setSubscriptionStartDate(request.getSubscriptionStartDate());
        invoice.setSubscriptionEndDate(request.getSubscriptionEndDate());
        java.math.BigDecimal basicAmount = request.getBasicAmount() != null ? request.getBasicAmount()
                : java.math.BigDecimal.ZERO;
        java.math.BigDecimal tax = request.getTax() != null ? request.getTax() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal discount = request.getDiscount() != null ? request.getDiscount()
                : java.math.BigDecimal.ZERO;
        java.math.BigDecimal otherCharges = request.getOtherCharges() != null ? request.getOtherCharges()
                : java.math.BigDecimal.ZERO;
        java.math.BigDecimal advanceAmount = request.getAdvanceAmount() != null ? request.getAdvanceAmount()
                : java.math.BigDecimal.ZERO;

        // Total = Basic + Tax - Discount + OtherCharges
        java.math.BigDecimal totalAmount = basicAmount.add(tax).subtract(discount).add(otherCharges);

        // Pending = Total - Advance
        java.math.BigDecimal pendingAmount = totalAmount.subtract(advanceAmount);

        invoice.setBasicAmount(basicAmount);
        invoice.setTax(tax);
        invoice.setDiscount(discount);
        invoice.setOtherCharges(otherCharges);
        invoice.setAdvanceAmount(advanceAmount);

        invoice.setTotalAmount(totalAmount);
        invoice.setPendingAmount(pendingAmount);
        invoice.setPaymentStatus(request.getPaymentStatus());
        invoice.setCurrency(request.getCurrency());

        return TenantSubscriptionInvoiceResponse.fromEntity(repository.save(invoice));
    }

    @Override
    public TenantSubscriptionInvoiceResponse updateStatus(Long id,
            com.example.multi_tanent.master.entity.PaymentStatus status) {
        TenantSubscriptionInvoice invoice = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
        invoice.setPaymentStatus(status);
        return TenantSubscriptionInvoiceResponse.fromEntity(repository.save(invoice));
    }

    @Override
    public TenantSubscriptionInvoiceResponse getInvoice(Long id) {
        return repository.findById(id)
                .map(TenantSubscriptionInvoiceResponse::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
    }

    @Override
    public TenantSubscriptionInvoice getInvoiceEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
    }

    private String generateInvoiceNumber() {
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        int randomNum = new java.util.Random().nextInt(900) + 100; // 3 digit random number
        return "INV-" + timestamp + "-" + randomNum;
    }

    @Override
    public java.util.List<TenantSubscriptionInvoiceResponse> getAllInvoices(Long masterTenantId) {
        return repository.findByMasterTenantId(masterTenantId).stream()
                .map(TenantSubscriptionInvoiceResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }
}
