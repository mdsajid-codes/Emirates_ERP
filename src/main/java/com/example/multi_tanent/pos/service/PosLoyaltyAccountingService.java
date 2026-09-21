package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.service.posting.GLPostingEngine;
import com.example.multi_tanent.pos.entity.Sale;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosLoyaltyAccountingService {

    private final GLPostingEngine postingEngine;

    @Transactional
    public Long postLoyaltyRedeemed(Sale sale, int pointsRedeemed, BigDecimal pointValueAED, String username) {
        if (sale == null || sale.getTenant() == null || pointsRedeemed <= 0) {
            return null;
        }

        try {
            Long tenantId = sale.getTenant().getId();
            BigDecimal discountValue = BigDecimal.valueOf(pointsRedeemed).multiply(pointValueAED != null ? pointValueAED : BigDecimal.valueOf(0.05));

            PostingRequest postingRequest = new PostingRequest();
            postingRequest.setDocumentType(DocumentType.POS_SALE);
            postingRequest.setReferenceId(sale.getId());
            postingRequest.setReferenceNumber("LOYALTY-" + sale.getId());
            postingRequest.setDescription("Loyalty Points Redemption for Sale #" + sale.getInvoiceNo() + " (" + pointsRedeemed + " pts)");

            PostingRequest.Line line = new PostingRequest.Line();
            line.setAmount(discountValue);
            line.setDescription("Loyalty Points Redemption");
            postingRequest.setLines(List.of(line));

            PostingResult result = postingEngine.postDocument(postingRequest, username);
            if (result.isSuccess() && result.getJournalEntryId() != null) {
                log.info("Posted Loyalty Points Redemption JE #{} for Sale #{}", result.getJournalEntryId(), sale.getId());
                return result.getJournalEntryId();
            }
        } catch (Exception e) {
            log.error("Failed to post Loyalty Points Redemption to GL: {}", e.getMessage(), e);
        }
        return null;
    }
}
