package com.example.multi_tanent.accounts.service.impl;

import com.example.multi_tanent.accounts.dto.journal.JournalEntryRequest;
import com.example.multi_tanent.accounts.dto.journal.JournalEntryResponse;
import com.example.multi_tanent.accounts.dto.settlement.AccMutualSettlementRequest;
import com.example.multi_tanent.accounts.dto.settlement.AccMutualSettlementResponse;
import com.example.multi_tanent.accounts.entity.AccMutualSettlement;
import com.example.multi_tanent.accounts.entity.AccMutualSettlementApLine;
import com.example.multi_tanent.accounts.entity.AccMutualSettlementArLine;
import com.example.multi_tanent.accounts.entity.enums.SettlementStatus;
import com.example.multi_tanent.accounts.repository.AccMutualSettlementRepository;
import com.example.multi_tanent.accounts.repository.PartyGLAccountRepository;
import com.example.multi_tanent.accounts.service.AccMutualSettlementService;
import com.example.multi_tanent.accounts.service.journal.JournalEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import com.example.multi_tanent.accounts.event.PaymentAllocatedEvent;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccMutualSettlementServiceImpl implements AccMutualSettlementService {

    private final AccMutualSettlementRepository settlementRepository;
    private final PartyGLAccountRepository partyGLAccountRepository;
    private final JournalEntryService journalEntryService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public AccMutualSettlementResponse createDraft(AccMutualSettlementRequest request, String tenantId) {
        // Validate AP/AR sum
        BigDecimal apTotal = request.getApLines() == null ? BigDecimal.ZERO :
                request.getApLines().stream().map(AccMutualSettlementRequest.AccMutualSettlementLineRequest::getAllocatedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal arTotal = request.getArLines() == null ? BigDecimal.ZERO :
                request.getArLines().stream().map(AccMutualSettlementRequest.AccMutualSettlementLineRequest::getAllocatedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        if (apTotal.compareTo(arTotal) != 0) {
            throw new RuntimeException("Settlement AP total must equal AR total. AP: " + apTotal + ", AR: " + arTotal);
        }
        
        if (apTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Settlement amount must be greater than zero.");
        }

        String settlementNumber = "MS-" + LocalDate.now().getYear() + "-" + System.currentTimeMillis(); // Simple generator

        AccMutualSettlement settlement = AccMutualSettlement.builder()
                .settlementNumber(settlementNumber)
                .settlementDate(request.getSettlementDate())
                .partnerId(request.getPartnerId())
                .currencyId(request.getCurrencyId())
                .settlementAmount(apTotal)
                .notes(request.getNotes())
                .tenantId(tenantId)
                .build();

        if (request.getApLines() != null) {
            for (var apLineReq : request.getApLines()) {
                AccMutualSettlementApLine line = AccMutualSettlementApLine.builder()
                        .invoiceId(apLineReq.getInvoiceId())
                        .allocatedAmount(apLineReq.getAllocatedAmount())
                        .build();
                settlement.addApLine(line);
            }
        }

        if (request.getArLines() != null) {
            for (var arLineReq : request.getArLines()) {
                AccMutualSettlementArLine line = AccMutualSettlementArLine.builder()
                        .invoiceId(arLineReq.getInvoiceId())
                        .allocatedAmount(arLineReq.getAllocatedAmount())
                        .build();
                settlement.addArLine(line);
            }
        }

        settlement = settlementRepository.save(settlement);
        return mapToResponse(settlement);
    }

    @Override
    @Transactional
    public AccMutualSettlementResponse postSettlement(Long id, String tenantId) {
        AccMutualSettlement settlement = settlementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));
        
        if (!settlement.getTenantId().equals(tenantId)) throw new RuntimeException("Settlement not found for tenant");
        if (settlement.getStatus() != SettlementStatus.DRAFT) throw new RuntimeException("Only DRAFT settlements can be posted");

        Long tenantIdLong = Long.valueOf(tenantId.replace("neon", ""));
        
        // Find GL Accounts for Partner
        // AP account
        com.example.multi_tanent.accounts.entity.PartyGLAccount apPartyGL = partyGLAccountRepository.findByPartyTypeAndPartyIdAndTenant(
                com.example.multi_tanent.accounts.entity.enums.PartyType.SUPPLIER, settlement.getPartnerId(), tenantIdLong)
                .orElseThrow(() -> new RuntimeException("AP GL Account not found for partner"));
        Long apGlId = apPartyGL.getAccountsPayable().getAccountId();
        
        // AR account
        com.example.multi_tanent.accounts.entity.PartyGLAccount arPartyGL = partyGLAccountRepository.findByPartyTypeAndPartyIdAndTenant(
                com.example.multi_tanent.accounts.entity.enums.PartyType.CUSTOMER, settlement.getPartnerId(), tenantIdLong)
                .orElseThrow(() -> new RuntimeException("AR GL Account not found for partner"));
        Long arGlId = arPartyGL.getAccountsReceivable().getAccountId();

        JournalEntryRequest jeReq = new JournalEntryRequest();
        jeReq.setEntryDate(settlement.getSettlementDate());
        jeReq.setReferenceNumber(settlement.getSettlementNumber());
        jeReq.setDescription(settlement.getNotes() != null ? settlement.getNotes() : "Mutual Settlement");
        
        List<JournalEntryRequest.JournalEntryLineRequest> lines = new ArrayList<>();
        // Debit AP
        JournalEntryRequest.JournalEntryLineRequest debitAp = new JournalEntryRequest.JournalEntryLineRequest();
        debitAp.setAccountId(apGlId);
        debitAp.setDebitAmount(settlement.getSettlementAmount());
        lines.add(debitAp);
        
        // Credit AR
        JournalEntryRequest.JournalEntryLineRequest creditAr = new JournalEntryRequest.JournalEntryLineRequest();
        creditAr.setAccountId(arGlId);
        creditAr.setCreditAmount(settlement.getSettlementAmount());
        lines.add(creditAr);

        jeReq.setLines(lines);

        JournalEntryResponse jeRes = journalEntryService.createDraft(jeReq, tenantId);
        journalEntryService.post(jeRes.getJournalEntryId(), tenantId);

        com.example.multi_tanent.accounts.entity.journal.JournalEntry jeEntity = new com.example.multi_tanent.accounts.entity.journal.JournalEntry();
        jeEntity.setJournalEntryId(jeRes.getJournalEntryId());

        settlement.setJournalEntry(jeEntity);
        settlement.setStatus(SettlementStatus.POSTED);
        
        if (settlement.getApLines() != null) {
            for (AccMutualSettlementApLine apLine : settlement.getApLines()) {
                eventPublisher.publishEvent(new PaymentAllocatedEvent(
                        this, tenantId, apLine.getInvoiceId(), "SUPPLIER", apLine.getAllocatedAmount()
                ));
            }
        }
        
        if (settlement.getArLines() != null) {
            for (AccMutualSettlementArLine arLine : settlement.getArLines()) {
                eventPublisher.publishEvent(new PaymentAllocatedEvent(
                        this, tenantId, arLine.getInvoiceId(), "CUSTOMER", arLine.getAllocatedAmount()
                ));
            }
        }

        settlement = settlementRepository.save(settlement);
        return mapToResponse(settlement);
    }

    @Override
    @Transactional
    public AccMutualSettlementResponse reverseSettlement(Long id, String tenantId) {
        AccMutualSettlement settlement = settlementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));
        
        if (!settlement.getTenantId().equals(tenantId)) throw new RuntimeException("Settlement not found for tenant");
        if (settlement.getStatus() != SettlementStatus.POSTED) throw new RuntimeException("Only POSTED settlements can be reversed");

        // Logic to reverse GL entry
        // For simplicity, we just create a reverse entry or call reverse on JE service.
        // Assuming journalEntryService.reverse(journalEntryId, date, description) exists or we do it manually.
        throw new UnsupportedOperationException("Reversal logic to be implemented");
    }

    @Override
    public AccMutualSettlementResponse getSettlement(Long id, String tenantId) {
        AccMutualSettlement settlement = settlementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Settlement not found"));
        if (!settlement.getTenantId().equals(tenantId)) throw new RuntimeException("Settlement not found for tenant");
        return mapToResponse(settlement);
    }

    @Override
    public List<AccMutualSettlementResponse> getAllSettlements(String tenantId) {
        return settlementRepository.findByTenantId(tenantId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AccMutualSettlementResponse mapToResponse(AccMutualSettlement settlement) {
        AccMutualSettlementResponse res = new AccMutualSettlementResponse();
        res.setId(settlement.getId());
        res.setSettlementNumber(settlement.getSettlementNumber());
        res.setSettlementDate(settlement.getSettlementDate());
        res.setPartnerId(settlement.getPartnerId());
        res.setPartnerName(settlement.getPartnerName());
        res.setCurrencyId(settlement.getCurrencyId());
        res.setSettlementAmount(settlement.getSettlementAmount());
        res.setStatus(settlement.getStatus());
        res.setJournalEntryId(settlement.getJournalEntry() != null ? settlement.getJournalEntry().getJournalEntryId() : null);
        res.setReversalEntryId(settlement.getReversalEntry() != null ? settlement.getReversalEntry().getJournalEntryId() : null);
        res.setNotes(settlement.getNotes());
        res.setCreatedBy(settlement.getCreatedBy());
        res.setCreatedAt(settlement.getCreatedAt());
        res.setTenantId(settlement.getTenantId());

        if (settlement.getApLines() != null) {
            res.setApLines(settlement.getApLines().stream().map(a -> {
                AccMutualSettlementResponse.AccMutualSettlementLineResponse r = new AccMutualSettlementResponse.AccMutualSettlementLineResponse();
                r.setId(a.getId());
                r.setInvoiceId(a.getInvoiceId());
                r.setInvoiceNumber(a.getInvoiceNumber());
                r.setInvoiceDate(a.getInvoiceDate());
                r.setInvoiceTotal(a.getInvoiceTotal());
                r.setAllocatedAmount(a.getAllocatedAmount());
                return r;
            }).collect(Collectors.toList()));
        }

        if (settlement.getArLines() != null) {
            res.setArLines(settlement.getArLines().stream().map(a -> {
                AccMutualSettlementResponse.AccMutualSettlementLineResponse r = new AccMutualSettlementResponse.AccMutualSettlementLineResponse();
                r.setId(a.getId());
                r.setInvoiceId(a.getInvoiceId());
                r.setInvoiceNumber(a.getInvoiceNumber());
                r.setInvoiceDate(a.getInvoiceDate());
                r.setInvoiceTotal(a.getInvoiceTotal());
                r.setAllocatedAmount(a.getAllocatedAmount());
                return r;
            }).collect(Collectors.toList()));
        }

        return res;
    }
}
