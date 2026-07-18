package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.purchases.dto.*;
import com.example.multi_tanent.purchases.entity.*;
import com.example.multi_tanent.purchases.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurRfqResponseService {

    private final PurRfqResponseRepository responseRepo;
    private final PurRequestForQuotationRepository rfqRepo;
    private final PurSupplierTenderingItemRepository itemRepo;
    private final PurSupplierTenderingQuestionRepository questionRepo;

    public PurRfqResponseResponse submitResponse(Long rfqId, PurRfqResponseRequest req, String responseNumber) {
        PurRequestForQuotation rfq = rfqRepo.findById(rfqId)
                .orElseThrow(() -> new EntityNotFoundException("RFQ not found"));

        PurRfqResponse resp = new PurRfqResponse();
        resp.setRfq(rfq);
        resp.setResponseNumber(responseNumber);
        resp.setValidTill(req.getValidTill());
        resp.setSubmittedAt(LocalDateTime.now());

        if (req.getItems() != null) {
            req.getItems().forEach(ir -> {
                PurRfqResponseItem item = new PurRfqResponseItem();
                item.setPrice(ir.getPrice());
                item.setComment(ir.getComment());

                PurSupplierTenderingItem ti = itemRepo.findById(ir.getTenderingItemId())
                        .orElseThrow(() -> new EntityNotFoundException("Tendering Item not found"));
                item.setTenderingItem(ti);

                resp.addItem(item);
            });
        }

        if (req.getAnswers() != null) {
            req.getAnswers().forEach(ar -> {
                PurRfqResponseAnswer ans = new PurRfqResponseAnswer();
                ans.setAnswer(ar.getAnswer());

                PurSupplierTenderingQuestion tq = questionRepo.findById(ar.getQuestionId())
                        .orElseThrow(() -> new EntityNotFoundException("Question not found"));
                ans.setQuestion(tq);

                resp.addAnswer(ans);
            });
        }

        PurRfqResponse saved = responseRepo.save(resp);
        return toResponse(saved);
    }

    public PurRfqResponseResponse getResponseByRfqId(Long rfqId) {
        return responseRepo.findByRfqId(rfqId).map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("No response for RFQ"));
    }

    private PurRfqResponseResponse toResponse(PurRfqResponse resp) {
        return PurRfqResponseResponse.builder()
                .id(resp.getId())
                .responseNumber(resp.getResponseNumber())
                .rfqId(resp.getRfq().getId())
                .rfqNumber(resp.getRfq().getRfqNumber())
                .validTill(resp.getValidTill())
                .submittedAt(resp.getSubmittedAt())
                .build();
    }
}
