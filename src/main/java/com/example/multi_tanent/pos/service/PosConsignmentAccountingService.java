package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.service.posting.GLPostingEngine;
import com.example.multi_tanent.pos.entity.PosConsignmentSettlement;
import com.example.multi_tanent.pos.entity.Sale;
import com.example.multi_tanent.pos.repository.PosConsignmentSettlementRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosConsignmentAccountingService {

    private final PosConsignmentSettlementRepository consignmentRepository;
    private final GLPostingEngine postingEngine;

    @Transactional
    public PosConsignmentSettlement processConsignmentSale(Sale sale, Long vendorId, Long vendorPayoutCents, Long storeCommissionCents, String username) {
        if (sale == null || sale.getTenant() == null) {
            throw new IllegalArgumentException("Sale or Tenant cannot be null for consignment processing.");
        }

        Tenant tenant = sale.getTenant();

        PosConsignmentSettlement settlement = new PosConsignmentSettlement();
        settlement.setTenantId(tenant.getTenantId());
        settlement.setVendorId(vendorId);
        settlement.setSaleId(sale.getId());
        settlement.setVendorPayoutCents(vendorPayoutCents != null ? vendorPayoutCents : 0L);
        settlement.setStoreCommissionCents(storeCommissionCents != null ? storeCommissionCents : 0L);

        settlement = consignmentRepository.save(settlement);

        try {
            PostingRequest postingRequest = new PostingRequest();
            postingRequest.setDocumentType(DocumentType.POS_SALE);
            postingRequest.setReferenceId(settlement.getId());
            postingRequest.setReferenceNumber("CONSIGN-" + sale.getId());
            postingRequest.setDescription("Consignment Vendor Split for Sale #" + sale.getInvoiceNo());
            postingRequest.setCompanyId(vendorId); // Vendor ID passed as Company ID for AP resolution

            PostingRequest.Line line = new PostingRequest.Line();
            BigDecimal gross = BigDecimal.valueOf(settlement.getVendorPayoutCents() + settlement.getStoreCommissionCents()).divide(BigDecimal.valueOf(100));
            BigDecimal fee = BigDecimal.valueOf(settlement.getStoreCommissionCents()).divide(BigDecimal.valueOf(100));

            line.setAmount(gross);
            line.setCogsAmount(fee);
            line.setDescription("Consignment Item Payout");
            postingRequest.setLines(java.util.List.of(line));

            PostingResult result = postingEngine.postDocument(postingRequest, username);
            if (result.isSuccess() && result.getJournalEntryId() != null) {
                settlement.setJournalEntryId(result.getJournalEntryId());
                log.info("Posted Consignment Vendor Split JE #{} for Sale #{}", result.getJournalEntryId(), sale.getId());
            }
        } catch (Exception e) {
            log.error("Failed to auto-post Consignment Vendor Split to GL: {}", e.getMessage(), e);
        }

        return consignmentRepository.save(settlement);
    }
}
