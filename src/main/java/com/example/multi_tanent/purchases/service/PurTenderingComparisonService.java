package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.purchases.dto.PurTenderingComparisonDto;
import com.example.multi_tanent.purchases.entity.*;
import com.example.multi_tanent.purchases.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurTenderingComparisonService {

    private final PurSupplierTenderingRepository tenderingRepo;
    private final PurRequestForQuotationRepository rfqRepo;
    private final PurRfqResponseRepository responseRepo;

    @Transactional(readOnly = true)
    public PurTenderingComparisonDto generateComparison(Long tenderingId) {
        PurSupplierTendering tendering = tenderingRepo.findById(tenderingId)
                .orElseThrow(() -> new EntityNotFoundException("Tendering not found"));

        PurTenderingComparisonDto dto = new PurTenderingComparisonDto();
        dto.setTenderingId(tendering.getId());
        dto.setTenderNumber(tendering.getTenderNumber());

        List<PurRequestForQuotation> rfqs = rfqRepo.findByTenderingId(tenderingId);

        // Fetch valid responses
        List<PurRfqResponse> allResponses = rfqs.stream()
                .map(rfq -> responseRepo.findByRfqId(rfq.getId()).orElse(null))
                .filter(res -> res != null)
                .collect(Collectors.toList());

        // Build item comparisons
        List<PurTenderingComparisonDto.ItemComparison> itemComps = tendering.getItems().stream().map(ti -> {
            PurTenderingComparisonDto.ItemComparison ic = new PurTenderingComparisonDto.ItemComparison();
            ic.setTenderingItemId(ti.getId());
            ic.setItemName(ti.getItemName());
            ic.setRequiredQuantity(ti.getQuantity());

            Map<Long, BigDecimal> supplierPrices = new HashMap<>();
            Long bestSupId = null;
            BigDecimal bestPrice = null;

            for (PurRfqResponse res : allResponses) {
                Long supId = res.getRfq().getSupplier().getSupplierId();
                PurRfqResponseItem ri = res.getItems().stream()
                        .filter(i -> i.getTenderingItem().getId().equals(ti.getId()))
                        .findFirst().orElse(null);

                if (ri != null && ri.getPrice() != null) {
                    supplierPrices.put(supId, ri.getPrice());
                    if (bestPrice == null || ri.getPrice().compareTo(bestPrice) < 0) {
                        bestPrice = ri.getPrice();
                        bestSupId = supId;
                    }
                }
            }

            ic.setSupplierPrices(supplierPrices);
            ic.setBestSupplierId(bestSupId);
            return ic;
        }).collect(Collectors.toList());

        dto.setItemComparisons(itemComps);

        // Build question comparisons
        List<PurTenderingComparisonDto.QuestionComparison> qComps = tendering.getQuestions().stream().map(tq -> {
            PurTenderingComparisonDto.QuestionComparison qc = new PurTenderingComparisonDto.QuestionComparison();
            qc.setTenderingQuestionId(tq.getId());
            qc.setQuestionText(tq.getQuestionText() != null ? tq.getQuestionText()
                    : (tq.getQuestion() != null ? tq.getQuestion().getQuestionText() : ""));

            Map<Long, String> supplierAnswers = new HashMap<>();
            for (PurRfqResponse res : allResponses) {
                Long supId = res.getRfq().getSupplier().getSupplierId();
                PurRfqResponseAnswer ans = res.getAnswers().stream()
                        .filter(a -> a.getQuestion().getId().equals(tq.getId()))
                        .findFirst().orElse(null);

                if (ans != null && ans.getAnswer() != null) {
                    supplierAnswers.put(supId, ans.getAnswer());
                }
            }
            qc.setSupplierAnswers(supplierAnswers);
            return qc;
        }).collect(Collectors.toList());

        dto.setQuestionComparisons(qComps);

        return dto;
    }
}
