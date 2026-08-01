package com.example.multi_tanent.accounts.service.impl;

import com.example.multi_tanent.accounts.dto.journal.JournalEntryRequest;
import com.example.multi_tanent.accounts.dto.journal.JournalEntryResponse;
import com.example.multi_tanent.accounts.dto.payment.AccPaymentRequest;
import com.example.multi_tanent.accounts.dto.payment.AccPaymentResponse;
import com.example.multi_tanent.accounts.entity.AccBankAccount;
import com.example.multi_tanent.accounts.entity.AccPayment;
import com.example.multi_tanent.accounts.entity.AccPaymentInvoiceAllocation;
import com.example.multi_tanent.accounts.entity.AccPostDatedCheque;
import com.example.multi_tanent.accounts.entity.enums.PaymentStatus;
import com.example.multi_tanent.accounts.entity.enums.PaymentType;
import com.example.multi_tanent.accounts.entity.enums.PdcStatus;
import com.example.multi_tanent.accounts.entity.enums.PdcType;
import com.example.multi_tanent.accounts.repository.AccBankAccountRepository;
import com.example.multi_tanent.accounts.repository.AccPaymentRepository;
import com.example.multi_tanent.accounts.repository.AccPostDatedChequeRepository;
import com.example.multi_tanent.accounts.repository.PartyGLAccountRepository;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.entity.enums.PaymentMethod;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.accounts.service.AccCashFlowRecorder;
import com.example.multi_tanent.accounts.service.AccPaymentService;
import com.example.multi_tanent.accounts.service.journal.JournalEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import com.example.multi_tanent.accounts.event.PaymentAllocatedEvent;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccPaymentServiceImpl implements AccPaymentService {

    private final AccPaymentRepository paymentRepository;
    private final AccBankAccountRepository bankAccountRepository;
    private final AccPostDatedChequeRepository pdcRepository;
    private final PartyGLAccountRepository partyGLAccountRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final PartyRepository partyRepository;
    private final TenantRepository tenantRepository;
    private final JournalEntryService journalEntryService;
    private final AccCashFlowRecorder cashFlowRecorder;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Resolves a tenant identifier (numeric string or slug like "star_1111") to a Long ID.
     * First tries a direct numeric parse; if that fails, looks up the tenant by tenantId
     * string or name in the database.
     */
    private Long getTenantIdLong(String tenantIdStr) {
        if (tenantIdStr == null || tenantIdStr.trim().isEmpty()) {
            tenantIdStr = TenantContext.getTenantId();
        }
        if (tenantIdStr == null) return 1L;
        try {
            return Long.parseLong(tenantIdStr);
        } catch (NumberFormatException e) {
            String finalTenantIdStr = tenantIdStr;
            return tenantRepository.findByTenantId(finalTenantIdStr)
                    .or(() -> tenantRepository.findByName(finalTenantIdStr))
                    .map(Tenant::getId)
                    .orElseGet(() -> {
                        try {
                            String numOnly = finalTenantIdStr.replaceAll("\\D+", "");
                            return numOnly.isEmpty() ? 1L : Long.parseLong(numOnly);
                        } catch (Exception ex) {
                            return 1L;
                        }
                    });
        }
    }

    @Override
    @Transactional
    public AccPaymentResponse createPayment(AccPaymentRequest request, String tenantId) {
        String paymentNumber = generatePaymentNumber(request.getPaymentType(), tenantId);

        AccBankAccount bankAccount = request.getBankAccountId() != null ? 
                bankAccountRepository.findById(request.getBankAccountId()).orElse(null) : null;

        AccPayment payment = AccPayment.builder()
                .paymentNumber(paymentNumber)
                .paymentDate(request.getPaymentDate())
                .paymentType(request.getPaymentType())
                .paymentMethod(request.getPaymentMethod())
                .partnerId(request.getPartnerId())
                .partnerType(request.getPartnerType())
                .amount(request.getAmount())
                .currencyId(request.getCurrencyId())
                .bankAccount(bankAccount)
                .reference(request.getReference())
                .notes(request.getNotes())
                .tenantId(tenantId)
                .build();

        if (request.getAllocations() != null) {
            for (var allocReq : request.getAllocations()) {
                AccPaymentInvoiceAllocation allocation = AccPaymentInvoiceAllocation.builder()
                        .invoiceId(allocReq.getInvoiceId())
                        .allocatedAmount(allocReq.getAllocatedAmount())
                        .build();
                payment.addAllocation(allocation);
            }
        }

        payment = paymentRepository.save(payment);

        // If PDC, create PDC record
        if (payment.getPaymentMethod() == com.example.multi_tanent.accounts.entity.enums.PaymentMethod.PDC) {
            AccPostDatedCheque pdc = AccPostDatedCheque.builder()
                    .pdcType(request.getPaymentType() == PaymentType.AR_RECEIPT ? PdcType.RECEIVED : PdcType.ISSUED)
                    .chequeNumber(request.getChequeNumber())
                    .chequeDate(request.getChequeDate())
                    .amount(request.getAmount())
                    .currencyId(request.getCurrencyId())
                    .bankAccount(payment.getBankAccount())
                    .partnerId(request.getPartnerId())
                    .partnerType(request.getPartnerType())
                    .status(request.getPaymentType() == PaymentType.AR_RECEIPT ? PdcStatus.PENDING_DEPOSIT : PdcStatus.ISSUED)
                    .payment(payment)
                    .tenantId(tenantId)
                    .build();
            pdc = pdcRepository.save(pdc);
            payment.setPdc(pdc);
            payment = paymentRepository.save(payment);
        }

        return mapToResponse(payment);
    }

    @Override
    @Transactional
    public AccPaymentResponse postPayment(Long id, String tenantId) {
        AccPayment payment = paymentRepository.findById(id).orElseThrow(() -> new RuntimeException("Payment not found"));
        if (!payment.getTenantId().equals(tenantId)) throw new RuntimeException("Payment not found for tenant");
        if (payment.getStatus() != PaymentStatus.DRAFT) throw new RuntimeException("Only DRAFT payments can be posted");

        // Prepare GL Entry
        JournalEntryRequest jeReq = new JournalEntryRequest();
        jeReq.setEntryDate(payment.getPaymentDate());
        jeReq.setReferenceNumber("PAY-" + payment.getPaymentNumber());
        jeReq.setDescription(payment.getNotes() != null && !payment.getNotes().isEmpty() 
            ? payment.getNotes() 
            : payment.getPaymentType().name().replace("_", " ") + " - " + payment.getPaymentNumber());
            
        boolean isAr = (payment.getPaymentType() == PaymentType.AR_RECEIPT || payment.getPaymentType() == PaymentType.PREPAYMENT_IN);
        DocumentType docType = DocumentType.MANUAL_JOURNAL;
        if (isAr) {
            if (payment.getPaymentMethod() == PaymentMethod.BANK) docType = DocumentType.RECEIPT_VOUCHER_BANK;
            else if (payment.getPaymentMethod() == PaymentMethod.CASH) docType = DocumentType.RECEIPT_VOUCHER_CASH;
            else if (payment.getPaymentMethod() == PaymentMethod.PDC) docType = DocumentType.RECEIPT_VOUCHER_PDC;
        } else {
            if (payment.getPaymentMethod() == PaymentMethod.BANK) docType = DocumentType.PAYMENT_VOUCHER_BANK;
            else if (payment.getPaymentMethod() == PaymentMethod.CASH) docType = DocumentType.PAYMENT_VOUCHER_CASH;
            else if (payment.getPaymentMethod() == PaymentMethod.PDC) docType = DocumentType.PAYMENT_VOUCHER_PDC;
        }
        jeReq.setDocumentType(docType);
        
        // Find Party GL
        Long tenantIdLong = getTenantIdLong(tenantId);
        com.example.multi_tanent.accounts.entity.PartyGLAccount partyGL = partyGLAccountRepository.findByPartyTypeAndPartyIdAndTenant(
                com.example.multi_tanent.accounts.entity.enums.PartyType.valueOf(payment.getPartnerType()), payment.getPartnerId(), tenantIdLong)
                .orElse(null);

        Long partyGlId = null;
        if (partyGL != null) {
            partyGlId = (payment.getPaymentType() == PaymentType.AR_RECEIPT || payment.getPaymentType() == PaymentType.PREPAYMENT_IN)
                    ? (partyGL.getAccountsReceivable() != null ? partyGL.getAccountsReceivable().getAccountId() : null)
                    : (partyGL.getAccountsPayable() != null ? partyGL.getAccountsPayable().getAccountId() : null);
        }

        if (partyGlId == null) {
            // Fallback: automatically pick the first available generic AR/AP account
            List<ChartOfAccount> allAccounts = chartOfAccountRepository.findAllByTenant(tenantIdLong);
            
            ChartOfAccount defaultGl = allAccounts.stream()
                .filter(a -> a.getIsActive())
                .filter(a -> isAr ? 
                    (a.getSection() == AccountSection.BS_TRADE_RECEIVABLES) :
                    (a.getSection() == AccountSection.BS_TRADE_PAYABLES))
                .findFirst()
                .orElse(null);
                
            if (defaultGl != null) {
                partyGlId = defaultGl.getAccountId();
            } else {
                // Auto-create a default AR/AP account for the tenant to unblock testing
                ChartOfAccount newGl = new ChartOfAccount();
                newGl.setAccountCode((isAr ? "1200-" : "2200-") + (System.currentTimeMillis() % 10000));
                newGl.setDescription(isAr ? "Default Trade Receivables" : "Default Trade Payables");
                newGl.setAccountType(isAr ? com.example.multi_tanent.accounts.entity.enums.AccountBalanceType.DEBIT : com.example.multi_tanent.accounts.entity.enums.AccountBalanceType.CREDIT);
                newGl.setSection(isAr ? AccountSection.BS_TRADE_RECEIVABLES : AccountSection.BS_TRADE_PAYABLES);
                newGl.setIsActive(true);
                newGl.setCurrency("AED");
                com.example.multi_tanent.spersusers.enitity.Tenant t = new com.example.multi_tanent.spersusers.enitity.Tenant();
                t.setId(tenantIdLong);
                newGl.setTenant(t);
                
                newGl = chartOfAccountRepository.save(newGl);
                partyGlId = newGl.getAccountId();
            }
        }

        // Find Bank GL if applicable
        Long bankGlId = null;
        if (payment.getBankAccount() != null) {
            bankGlId = payment.getBankAccount().getGlAccount().getAccountId();
        }
        
        if (bankGlId == null) {
            throw new RuntimeException("The selected Bank Account does not have a mapped GL Account.");
        }

        List<JournalEntryRequest.JournalEntryLineRequest> lines = new ArrayList<>();
        
        java.math.BigDecimal totalAllocated = java.math.BigDecimal.ZERO;
        if (payment.getAllocations() != null) {
            totalAllocated = payment.getAllocations().stream()
                    .map(AccPaymentInvoiceAllocation::getAllocatedAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        }
        
        java.math.BigDecimal overpayment = payment.getAmount().subtract(totalAllocated);
        if (overpayment.compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Allocated amount exceeds payment amount.");
        }

        if (payment.getPaymentType() == PaymentType.AR_RECEIPT) {
            // Debit Bank/PDC, Credit AR (for allocated amount)
            lines.add(createLine(partyGlId, null, totalAllocated, "AR Payment Allocated"));
            
            if (overpayment.compareTo(java.math.BigDecimal.ZERO) > 0) {
                Long prepayGlId = partyGL.getAdvancesReceived() != null ? partyGL.getAdvancesReceived().getAccountId() : partyGlId;
                lines.add(createLine(prepayGlId, null, overpayment, "AR Overpayment/Advance"));
            }

            if (payment.getPaymentMethod() == com.example.multi_tanent.accounts.entity.enums.PaymentMethod.PDC) {
                lines.add(createLine(bankGlId, payment.getAmount(), null, "PDC Received"));
            } else {
                lines.add(createLine(bankGlId, payment.getAmount(), null, "Bank Receipt"));
            }
        } else if (payment.getPaymentType() == PaymentType.AP_PAYMENT) {
            // Debit AP (for allocated amount), Credit Bank/PDC
            lines.add(createLine(partyGlId, totalAllocated, null, "AP Payment Allocated"));

            if (overpayment.compareTo(java.math.BigDecimal.ZERO) > 0) {
                Long prepayGlId = partyGL.getAdvancesPaid() != null ? partyGL.getAdvancesPaid().getAccountId() : partyGlId;
                lines.add(createLine(prepayGlId, overpayment, null, "AP Overpayment/Advance"));
            }

            lines.add(createLine(bankGlId, null, payment.getAmount(), "Bank Payment"));
        } else if (payment.getPaymentType() == PaymentType.PREPAYMENT_IN) {
            lines.add(createLine(bankGlId, payment.getAmount(), null, "Prepayment Receipt"));
            lines.add(createLine(partyGlId, null, payment.getAmount(), "Prepayment Liability"));
        } else if (payment.getPaymentType() == PaymentType.PREPAYMENT_OUT) {
            lines.add(createLine(partyGlId, payment.getAmount(), null, "Prepaid Asset"));
            lines.add(createLine(bankGlId, null, payment.getAmount(), "Bank Payment"));
        }

        for (int i = 0; i < lines.size(); i++) {
            lines.get(i).setLineNumber(i + 1);
        }
        jeReq.setLines(lines);

        // Call Journal Entry Service
        JournalEntryResponse jeRes = journalEntryService.createDraft(jeReq, tenantId); 
        journalEntryService.post(jeRes.getJournalEntryId(), tenantId);

        com.example.multi_tanent.accounts.entity.journal.JournalEntry jeEntity = new com.example.multi_tanent.accounts.entity.journal.JournalEntry();
        jeEntity.setJournalEntryId(jeRes.getJournalEntryId());
        
        payment.setJournalEntry(jeEntity);
        payment.setStatus(PaymentStatus.POSTED);
        
        if (payment.getPdc() != null) {
            AccPostDatedCheque pdc = payment.getPdc();
            pdc.setStep1JournalEntry(jeEntity);
            pdcRepository.save(pdc);
        }

        paymentRepository.save(payment);

        if (payment.getAllocations() != null) {
            for (AccPaymentInvoiceAllocation alloc : payment.getAllocations()) {
                eventPublisher.publishEvent(new PaymentAllocatedEvent(
                        this, tenantId, alloc.getInvoiceId(), payment.getPartnerType(), alloc.getAllocatedAmount()
                ));
            }
        }

        cashFlowRecorder.recordCashFlow(payment);

        return mapToResponse(payment);
    }

    @Override
    public AccPaymentResponse getPayment(Long id, String tenantId) {
        AccPayment payment = paymentRepository.findById(id).orElseThrow(() -> new RuntimeException("Payment not found"));
        if (!payment.getTenantId().equals(tenantId)) throw new RuntimeException("Payment not found for tenant");
        return mapToResponse(payment);
    }

    @Override
    public List<AccPaymentResponse> getAllPayments(String tenantId) {
        return paymentRepository.findByTenantId(tenantId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private String generatePaymentNumber(PaymentType type, String tenantId) {
        String prefix = type == PaymentType.AR_RECEIPT ? "ARR-" : "APP-";
        Long count = paymentRepository.countByTenantIdAndPaymentNumberStartingWith(tenantId, prefix);
        return prefix + LocalDate.now().getYear() + "-" + String.format("%04d", count + 1);
    }

    private JournalEntryRequest.JournalEntryLineRequest createLine(Long glAccountId, java.math.BigDecimal debit, java.math.BigDecimal credit, String notes) {
        JournalEntryRequest.JournalEntryLineRequest line = new JournalEntryRequest.JournalEntryLineRequest();
        line.setAccountId(glAccountId);
        line.setDebitAmount(debit);
        line.setCreditAmount(credit);
        line.setDescription(notes);
        return line;
    }

    private AccPaymentResponse mapToResponse(AccPayment payment) {
        AccPaymentResponse res = new AccPaymentResponse();
        res.setId(payment.getId());
        res.setPaymentNumber(payment.getPaymentNumber());
        res.setPaymentDate(payment.getPaymentDate());
        res.setPaymentType(payment.getPaymentType());
        res.setPaymentMethod(payment.getPaymentMethod());
        res.setPartnerId(payment.getPartnerId());
        res.setPartnerType(payment.getPartnerType());
        res.setAmount(payment.getAmount());
        res.setCurrencyId(payment.getCurrencyId());
        res.setBankAccountId(payment.getBankAccount() != null ? payment.getBankAccount().getId() : null);
        res.setReference(payment.getReference());
        res.setStatus(payment.getStatus());
        res.setJournalEntryId(payment.getJournalEntry() != null ? payment.getJournalEntry().getJournalEntryId() : null);
        res.setPdcId(payment.getPdc() != null ? payment.getPdc().getId() : null);
        res.setNotes(payment.getNotes());
        res.setTenantId(payment.getTenantId());

        if (payment.getAllocations() != null) {
            res.setAllocations(payment.getAllocations().stream().map(a -> {
                AccPaymentResponse.AccPaymentAllocationResponse ar = new AccPaymentResponse.AccPaymentAllocationResponse();
                ar.setId(a.getId());
                ar.setInvoiceId(a.getInvoiceId());
                ar.setAllocatedAmount(a.getAllocatedAmount());
                return ar;
            }).collect(Collectors.toList()));
        }

        return res;
    }

    @Override
    public List<com.example.multi_tanent.accounts.dto.payment.PaymentRegisterResponse> getPaymentRegister(String tenantId) {
        return paymentRepository.findByTenantId(tenantId).stream().map(payment -> {
            com.example.multi_tanent.accounts.dto.payment.PaymentRegisterResponse res = new com.example.multi_tanent.accounts.dto.payment.PaymentRegisterResponse();
            res.setId(payment.getId());
            res.setPaymentNumber(payment.getPaymentNumber());
            res.setPaymentDate(payment.getPaymentDate());
            res.setPaymentType(payment.getPaymentType());
            res.setPaymentMethod(payment.getPaymentMethod());
            res.setPartnerId(payment.getPartnerId());
            
            String partnerName = partyRepository.findById(payment.getPartnerId())
                .map(p -> p.getCompanyName() != null && !p.getCompanyName().isEmpty() 
                    ? p.getCompanyName() : p.getPrimaryContactPersonFull())
                .orElse("Unknown Partner");
            res.setPartnerName(partnerName);
            
            res.setAmount(payment.getAmount());
            res.setCurrencyId(payment.getCurrencyId());
            if (payment.getBankAccount() != null) {
                res.setBankAccountId(payment.getBankAccount().getId());
                res.setBankAccountName(payment.getBankAccount().getAccountName());
            }
            res.setReference(payment.getReference());
            res.setStatus(payment.getStatus());
            res.setJournalEntryId(payment.getJournalEntry() != null ? payment.getJournalEntry().getJournalEntryId() : null);
            res.setTenantId(payment.getTenantId());
            return res;
        }).collect(Collectors.toList());
    }
}
