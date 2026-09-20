package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.service.posting.GLPostingEngine;
import com.example.multi_tanent.pos.entity.PosSettlement;
import com.example.multi_tanent.pos.entity.Sale;
import com.example.multi_tanent.pos.repository.PosSettlementRepository;
import com.example.multi_tanent.pos.repository.SaleRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosSettlementService {

    private final PosSettlementRepository settlementRepository;
    private final SaleRepository saleRepository;
    private final TenantRepository tenantRepository;
    private final GLPostingEngine postingEngine;

    @Transactional
    public PosSettlement processCardSettlementBatch(String settlementRef, Long grossAmountCents, Long merchantFeeCents, Long bankAccountId, String tenantIdStr, String username) {
        Tenant tenant = tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantIdStr));

        long gross = (grossAmountCents != null ? grossAmountCents : 0L);
        long fee = (merchantFeeCents != null ? merchantFeeCents : 0L);
        long net = gross - fee;

        PosSettlement settlement = new PosSettlement();
        settlement.setTenantId(tenantIdStr);
        settlement.setSettlementRef(settlementRef);
        settlement.setSettledAt(LocalDateTime.now());
        settlement.setGrossAmountCents(gross);
        settlement.setMerchantFeeCents(fee);
        settlement.setNetAmountCents(net);
        settlement.setBankAccountId(bankAccountId);

        settlement = settlementRepository.save(settlement);

        try {
            PostingRequest postingRequest = new PostingRequest();
            postingRequest.setDocumentType(DocumentType.POS_CARD_SETTLEMENT);
            postingRequest.setReferenceId(settlement.getId());
            postingRequest.setReferenceNumber("SETTLE-" + settlementRef);
            postingRequest.setDescription("Card Terminal Batch Settlement #" + settlementRef);

            PostingRequest.Line line = new PostingRequest.Line();
            line.setAmount(BigDecimal.valueOf(gross).divide(BigDecimal.valueOf(100)));
            line.setCogsAmount(BigDecimal.valueOf(fee).divide(BigDecimal.valueOf(100)));
            line.setDimBankAccountId(bankAccountId);
            line.setDescription("Terminal Clearing Settlement #" + settlementRef);
            postingRequest.setLines(List.of(line));

            PostingResult result = postingEngine.postDocument(postingRequest, username);
            if (result.isSuccess() && result.getJournalEntryId() != null) {
                settlement.setJournalEntryId(result.getJournalEntryId());
                log.info("Posted POS Card Terminal Settlement JE #{} for ref {}", result.getJournalEntryId(), settlementRef);
            }
        } catch (Exception e) {
            log.error("Failed to auto-post Card Settlement to GL: {}", e.getMessage(), e);
        }

        List<Sale> pendingSales = saleRepository.findByTenantIdAndPaymentClearingStatus(tenant.getId(), "PENDING");
        for (Sale sale : pendingSales) {
            sale.setPaymentClearingStatus("SETTLED");
            sale.setSettlementId(settlement.getId());
            saleRepository.save(sale);
        }

        return settlementRepository.save(settlement);
    }
}
