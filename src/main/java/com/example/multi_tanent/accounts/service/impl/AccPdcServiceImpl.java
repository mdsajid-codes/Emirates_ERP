package com.example.multi_tanent.accounts.service.impl;

import com.example.multi_tanent.accounts.dto.journal.JournalEntryRequest;
import com.example.multi_tanent.accounts.dto.journal.JournalEntryResponse;
import com.example.multi_tanent.accounts.dto.payment.AccPdcBounceRequest;
import com.example.multi_tanent.accounts.dto.payment.AccPdcClearRequest;
import com.example.multi_tanent.accounts.dto.payment.AccPdcResponse;
import com.example.multi_tanent.accounts.entity.AccBankAccount;
import com.example.multi_tanent.accounts.entity.AccPayment;
import com.example.multi_tanent.accounts.entity.AccPostDatedCheque;
import com.example.multi_tanent.accounts.entity.enums.PdcStatus;
import com.example.multi_tanent.accounts.entity.enums.PdcType;
import com.example.multi_tanent.accounts.repository.AccBankAccountRepository;
import com.example.multi_tanent.accounts.repository.AccPaymentRepository;
import com.example.multi_tanent.accounts.repository.AccPostDatedChequeRepository;
import com.example.multi_tanent.accounts.repository.PartyGLAccountRepository;
import com.example.multi_tanent.accounts.service.AccCashFlowRecorder;
import com.example.multi_tanent.accounts.service.AccPdcService;
import com.example.multi_tanent.accounts.service.journal.JournalEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccPdcServiceImpl implements AccPdcService {

    private final AccPostDatedChequeRepository pdcRepository;
    private final AccPaymentRepository paymentRepository;
    private final AccBankAccountRepository bankAccountRepository;
    private final PartyGLAccountRepository partyGLAccountRepository;
    private final JournalEntryService journalEntryService;
    private final AccCashFlowRecorder cashFlowRecorder;

    @Override
    @Transactional
    public AccPdcResponse clearPdc(Long id, AccPdcClearRequest request, String tenantId) {
        AccPostDatedCheque pdc = pdcRepository.findById(id).orElseThrow(() -> new RuntimeException("PDC not found"));
        if (!pdc.getTenantId().equals(tenantId)) throw new RuntimeException("PDC not found for tenant");
        
        if (pdc.getStatus() != PdcStatus.PENDING_DEPOSIT && pdc.getStatus() != PdcStatus.DEPOSITED && pdc.getStatus() != PdcStatus.ISSUED) {
            throw new RuntimeException("PDC cannot be cleared from status " + pdc.getStatus());
        }

        // Get Bank GL
        AccBankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId())
                .orElseThrow(() -> new RuntimeException("Bank Account not found"));
        Long bankGlId = bankAccount.getGlAccount().getAccountId();

        // PDC Clearing GL (Assume bank GL or a separate configured PDC clearing GL)
        Long pdcClearingGlId = bankGlId; // Simplification, in real app might be different

        JournalEntryRequest jeReq = new JournalEntryRequest();
        jeReq.setEntryDate(request.getClearingDate());
        jeReq.setReferenceNumber("PDC-CLR-" + pdc.getChequeNumber());
        jeReq.setDescription("PDC Cleared: " + pdc.getChequeNumber());
        
        List<JournalEntryRequest.JournalEntryLineRequest> lines = new ArrayList<>();

        if (pdc.getPdcType() == PdcType.RECEIVED) {
            // Debit Bank, Credit PDC Clearing
            lines.add(createLine(bankGlId, pdc.getAmount(), null, "Bank Receipt"));
            lines.add(createLine(pdcClearingGlId, null, pdc.getAmount(), "PDC Clearing"));
        } else {
            // Debit PDC Clearing, Credit Bank
            lines.add(createLine(pdcClearingGlId, pdc.getAmount(), null, "PDC Clearing"));
            lines.add(createLine(bankGlId, null, pdc.getAmount(), "Bank Payment"));
        }

        jeReq.setLines(lines);

        JournalEntryResponse jeRes = journalEntryService.createDraft(jeReq, tenantId);
        journalEntryService.post(jeRes.getJournalEntryId(), tenantId);

        com.example.multi_tanent.accounts.entity.journal.JournalEntry jeEntity = new com.example.multi_tanent.accounts.entity.journal.JournalEntry();
        jeEntity.setJournalEntryId(jeRes.getJournalEntryId());

        pdc.setStatus(PdcStatus.CLEARED);
        pdc.setClearedAt(LocalDateTime.now());
        pdc.setStep2JournalEntry(jeEntity);
        pdc.setBankAccount(bankAccount);
        
        pdcRepository.save(pdc);

        // Record Cash Flow now that cash actually moved
        if (pdc.getPayment() != null) {
            AccPayment payment = pdc.getPayment();
            if (payment != null) {
                // Temporarily mock payment method to CASH so it gets recorded
                payment.setPaymentMethod(com.example.multi_tanent.accounts.entity.enums.PaymentMethod.CASH);
                payment.setPaymentDate(request.getClearingDate()); // Use clearing date
                cashFlowRecorder.recordCashFlow(payment);
                // Restore
                payment.setPaymentMethod(com.example.multi_tanent.accounts.entity.enums.PaymentMethod.PDC);
            }
        }

        return mapToResponse(pdc);
    }

    @Override
    @Transactional
    public AccPdcResponse bouncePdc(Long id, AccPdcBounceRequest request, String tenantId) {
        AccPostDatedCheque pdc = pdcRepository.findById(id).orElseThrow(() -> new RuntimeException("PDC not found"));
        if (!pdc.getTenantId().equals(tenantId)) throw new RuntimeException("PDC not found for tenant");

        if (pdc.getStatus() != PdcStatus.PENDING_DEPOSIT && pdc.getStatus() != PdcStatus.DEPOSITED && pdc.getStatus() != PdcStatus.ISSUED) {
            throw new RuntimeException("PDC cannot be bounced from status " + pdc.getStatus());
        }

        // Re-open AR/AP
        Long tenantIdLong = Long.valueOf(tenantId.replace("neon", ""));
        com.example.multi_tanent.accounts.entity.PartyGLAccount partyGL = partyGLAccountRepository.findByPartyTypeAndPartyIdAndTenant(
                com.example.multi_tanent.accounts.entity.enums.PartyType.valueOf(pdc.getPartnerType()), pdc.getPartnerId(), tenantIdLong)
                .orElseThrow(() -> new RuntimeException("Party GL Account not found"));
        Long partyGlId = pdc.getPdcType() == PdcType.RECEIVED
                ? (partyGL.getAccountsReceivable() != null ? partyGL.getAccountsReceivable().getAccountId() : null)
                : (partyGL.getAccountsPayable() != null ? partyGL.getAccountsPayable().getAccountId() : null);
        
        Long pdcClearingGlId = bankAccountRepository.findById(request.getBankAccountId())
                .orElseThrow(() -> new RuntimeException("Bank Account not found")).getGlAccount().getAccountId();

        JournalEntryRequest jeReq = new JournalEntryRequest();
        jeReq.setEntryDate(request.getBounceDate());
        jeReq.setReferenceNumber("PDC-BNC-" + pdc.getChequeNumber());
        jeReq.setDescription("PDC Bounced: " + pdc.getChequeNumber());
        
        List<JournalEntryRequest.JournalEntryLineRequest> lines = new ArrayList<>();

        if (pdc.getPdcType() == PdcType.RECEIVED) {
            // Debit AR (Reopen), Credit PDC Clearing
            lines.add(createLine(partyGlId, pdc.getAmount(), null, "AR Reopened"));
            lines.add(createLine(pdcClearingGlId, null, pdc.getAmount(), "PDC Reversed"));
            
            // Add bank charges
            if (request.getBankCharges() != null && request.getBankCharges().compareTo(BigDecimal.ZERO) > 0) {
                lines.add(createLine(request.getBankChargesGlAccountId(), request.getBankCharges(), null, "Bank Charges"));
                lines.add(createLine(pdcClearingGlId, null, request.getBankCharges(), "Bank Charge Payment"));
            }
        } else {
            // Debit PDC Clearing, Credit AP (Reopen)
            lines.add(createLine(pdcClearingGlId, pdc.getAmount(), null, "PDC Reversed"));
            lines.add(createLine(partyGlId, null, pdc.getAmount(), "AP Reopened"));
        }

        jeReq.setLines(lines);

        JournalEntryResponse jeRes = journalEntryService.createDraft(jeReq, tenantId);
        journalEntryService.post(jeRes.getJournalEntryId(), tenantId);

        com.example.multi_tanent.accounts.entity.journal.JournalEntry jeEntity = new com.example.multi_tanent.accounts.entity.journal.JournalEntry();
        jeEntity.setJournalEntryId(jeRes.getJournalEntryId());

        pdc.setStatus(PdcStatus.BOUNCED);
        pdc.setBankCharges(request.getBankCharges());
        pdc.setStep2JournalEntry(jeEntity);
        
        pdcRepository.save(pdc);

        return mapToResponse(pdc);
    }

    @Override
    public AccPdcResponse getPdc(Long id, String tenantId) {
        AccPostDatedCheque pdc = pdcRepository.findById(id).orElseThrow(() -> new RuntimeException("PDC not found"));
        if (!pdc.getTenantId().equals(tenantId)) throw new RuntimeException("PDC not found for tenant");
        return mapToResponse(pdc);
    }

    @Override
    public List<AccPdcResponse> getAllPdcs(String tenantId) {
        return pdcRepository.findByTenantId(tenantId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private JournalEntryRequest.JournalEntryLineRequest createLine(Long glAccountId, BigDecimal debit, BigDecimal credit, String notes) {
        JournalEntryRequest.JournalEntryLineRequest line = new JournalEntryRequest.JournalEntryLineRequest();
        line.setAccountId(glAccountId);
        line.setDebitAmount(debit);
        line.setCreditAmount(credit);
        line.setDescription(notes);
        return line;
    }

    private AccPdcResponse mapToResponse(AccPostDatedCheque pdc) {
        AccPdcResponse res = new AccPdcResponse();
        res.setId(pdc.getId());
        res.setPdcType(pdc.getPdcType());
        res.setChequeNumber(pdc.getChequeNumber());
        res.setChequeDate(pdc.getChequeDate());
        res.setAmount(pdc.getAmount());
        res.setCurrencyId(pdc.getCurrencyId());
        res.setBankName(pdc.getBankName());
        res.setBankAccountId(pdc.getBankAccount() != null ? pdc.getBankAccount().getId() : null);
        res.setPartnerId(pdc.getPartnerId());
        res.setPartnerType(pdc.getPartnerType());
        res.setStatus(pdc.getStatus());
        res.setPaymentId(pdc.getPayment() != null ? pdc.getPayment().getId() : null);
        res.setStep1JournalEntryId(pdc.getStep1JournalEntry() != null ? pdc.getStep1JournalEntry().getJournalEntryId() : null);
        res.setStep2JournalEntryId(pdc.getStep2JournalEntry() != null ? pdc.getStep2JournalEntry().getJournalEntryId() : null);
        res.setBankCharges(pdc.getBankCharges());
        res.setNotes(pdc.getNotes());
        res.setClearedAt(pdc.getClearedAt());
        res.setTenantId(pdc.getTenantId());
        return res;
    }
}
