package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.service.posting.GLPostingEngine;
import com.example.multi_tanent.pos.entity.PosShift;
import com.example.multi_tanent.pos.entity.Sale;
import com.example.multi_tanent.pos.repository.PosShiftRepository;
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
public class PosShiftAccountingService {

    private final PosShiftRepository shiftRepository;
    private final SaleRepository saleRepository;
    private final TenantRepository tenantRepository;
    private final GLPostingEngine postingEngine;

    @Transactional
    public PosShift closeAndReconcileShift(Long shiftId, Long actualCashCents, String username) {
        PosShift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new IllegalArgumentException("Shift not found with id: " + shiftId));

        if ("RECONCILED".equalsIgnoreCase(shift.getStatus())) {
            throw new IllegalStateException("Shift is already reconciled and closed.");
        }

        Tenant tenant = tenantRepository.findByTenantId(shift.getTenantId())
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + shift.getTenantId()));

        List<Sale> shiftSales = saleRepository.findByTenantAndShiftId(tenant, shiftId);
        long totalCashSalesCents = 0L;
        for (Sale sale : shiftSales) {
            if ("completed".equalsIgnoreCase(sale.getStatus()) && !Boolean.TRUE.equals(sale.getIsReturn())) {
                totalCashSalesCents += (sale.getTotalCents() != null ? sale.getTotalCents() : 0L);
            }
        }

        long openingCash = (shift.getOpeningCashCents() != null ? shift.getOpeningCashCents() : 0L);
        long expectedCash = openingCash + totalCashSalesCents;
        long overShort = (actualCashCents != null ? actualCashCents : 0L) - expectedCash;

        shift.setClosedAt(LocalDateTime.now());
        shift.setExpectedCashCents(expectedCash);
        shift.setActualCashCents(actualCashCents);
        shift.setOverShortCents(overShort);
        shift.setStatus("RECONCILED");

        if (overShort != 0) {
            try {
                PostingRequest postingRequest = new PostingRequest();
                postingRequest.setDocumentType(DocumentType.POS_SHIFT_RECONCILIATION);
                postingRequest.setReferenceId(shift.getId());
                postingRequest.setReferenceNumber("Z-REPORT-" + shift.getId());

                String description = (overShort > 0)
                        ? "POS Shift Cash Overage: Terminal " + shift.getTerminalId() + " Shift #" + shift.getId()
                        : "POS Shift Cash Shortage: Terminal " + shift.getTerminalId() + " Shift #" + shift.getId();
                postingRequest.setDescription(description);

                PostingRequest.Line line = new PostingRequest.Line();
                BigDecimal overShortAmount = BigDecimal.valueOf(Math.abs(overShort)).divide(BigDecimal.valueOf(100));
                line.setAmount(overShortAmount);
                line.setDescription(description);
                postingRequest.setLines(List.of(line));

                PostingResult result = postingEngine.postDocument(postingRequest, username);
                if (result.isSuccess() && result.getJournalEntryId() != null) {
                    shift.setZReportJournalEntryId(result.getJournalEntryId());
                    log.info("Posted POS Shift Z-Report Cash Variance JE #{} for shift id {}", result.getJournalEntryId(), shift.getId());
                }
            } catch (Exception e) {
                log.error("Failed to auto-post POS Shift Z-Report Cash Variance to GL: {}", e.getMessage(), e);
            }
        }

        return shiftRepository.save(shift);
    }
}
