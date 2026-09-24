package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.service.posting.GLPostingEngine;
import com.example.multi_tanent.pos.entity.Sale;
import com.example.multi_tanent.pos.entity.SaleItem;
import com.example.multi_tanent.pos.repository.SaleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosReturnAccountingService {

    private final GLPostingEngine postingEngine;
    private final SaleRepository saleRepository;

    @Transactional
    public Long postReturnToLedger(Sale returnSale, String username) {
        if (returnSale == null || returnSale.getTenant() == null) {
            log.warn("Cannot post return sale to GL: Sale or tenant is null");
            return null;
        }

        try {
            long totalCents = (returnSale.getTotalCents() != null ? returnSale.getTotalCents() : 0L);
            long taxCents = (returnSale.getTaxCents() != null ? returnSale.getTaxCents() : 0L);

            PostingRequest postingRequest = new PostingRequest();
            postingRequest.setDocumentType(DocumentType.POS_REFUND);
            postingRequest.setReferenceId(returnSale.getId());
            postingRequest.setReferenceNumber("POS-RETURN-" + (returnSale.getInvoiceNo() != null ? returnSale.getInvoiceNo() : returnSale.getId()));
            postingRequest.setDescription("POS Customer Return Refund #" + returnSale.getInvoiceNo());

            List<PostingRequest.Line> lines = new ArrayList<>();
            if (returnSale.getItems() != null && !returnSale.getItems().isEmpty()) {
                for (SaleItem item : returnSale.getItems()) {
                    long lineTotal = (item.getLineTotalCents() != null ? item.getLineTotalCents() : 0L);
                    long lineTax = (item.getTaxCents() != null ? item.getTaxCents() : 0L);
                    long lineCost = (item.getCostCents() != null ? item.getCostCents() : 0L);
                    long qty = (item.getQuantity() != null ? item.getQuantity() : 0L);

                    PostingRequest.Line line = new PostingRequest.Line();
                    if (item.getProduct() != null) {
                        line.setItemId(item.getProduct().getId());
                    }
                    line.setAmount(BigDecimal.valueOf(lineTotal).divide(BigDecimal.valueOf(100)));
                    line.setTaxAmount(BigDecimal.valueOf(lineTax).divide(BigDecimal.valueOf(100)));
                    line.setCogsAmount(BigDecimal.valueOf(lineCost * qty).divide(BigDecimal.valueOf(100)));
                    line.setQuantity(BigDecimal.valueOf(qty));
                    line.setDescription("Returned Item");
                    lines.add(line);
                }
            } else {
                PostingRequest.Line line = new PostingRequest.Line();
                line.setAmount(BigDecimal.valueOf(totalCents).divide(BigDecimal.valueOf(100)));
                line.setTaxAmount(BigDecimal.valueOf(taxCents).divide(BigDecimal.valueOf(100)));
                line.setDescription("POS Customer Refund");
                lines.add(line);
            }

            postingRequest.setLines(lines);

            PostingResult result = postingEngine.postDocument(postingRequest, username);
            if (result.isSuccess() && result.getJournalEntryId() != null) {
                returnSale.setJournalEntryId(result.getJournalEntryId());
                saleRepository.save(returnSale);
                log.info("Successfully posted POS Return #{} to GL as Journal Entry #{}", returnSale.getId(), result.getJournalEntryId());
                return result.getJournalEntryId();
            } else {
                log.error("Failed to post POS Return #{} to GL: {}", returnSale.getId(), result.getMessage());
            }
        } catch (Exception e) {
            log.error("Exception during GL posting for POS Return #{}: {}", returnSale.getId(), e.getMessage(), e);
        }
        return null;
    }
}
