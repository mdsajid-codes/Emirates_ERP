package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.entity.Sale;
import com.example.multi_tanent.pos.repository.SaleRepository;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosGlIntegrityScannerService {

    private final SaleRepository saleRepository;

    public IntegrityReportResponse scanPeriodIntegrity(Long tenantId, OffsetDateTime startDate, OffsetDateTime endDate) {
        List<Sale> periodSales = saleRepository.findByTenantIdAndInvoiceDateBetween(tenantId, startDate, endDate);

        long totalSalesCount = periodSales.size();
        long postedSalesCount = 0;
        long unpostedSalesCount = 0;

        long totalSalesCents = 0;
        long postedSalesCents = 0;
        long unpostedSalesCents = 0;

        for (Sale sale : periodSales) {
            long amt = (sale.getTotalCents() != null ? sale.getTotalCents() : 0L);
            totalSalesCents += amt;

            if (sale.getJournalEntryId() != null) {
                postedSalesCount++;
                postedSalesCents += amt;
            } else {
                unpostedSalesCount++;
                unpostedSalesCents += amt;
            }
        }

        double postingPercentage = totalSalesCount > 0
                ? (double) postedSalesCount / totalSalesCount * 100.0
                : 100.0;

        boolean isBalanced = (unpostedSalesCount == 0);

        return IntegrityReportResponse.builder()
                .tenantId(tenantId)
                .totalSalesCount(totalSalesCount)
                .postedSalesCount(postedSalesCount)
                .unpostedSalesCount(unpostedSalesCount)
                .totalSalesAmount(BigDecimal.valueOf(totalSalesCents).divide(BigDecimal.valueOf(100)))
                .postedSalesAmount(BigDecimal.valueOf(postedSalesCents).divide(BigDecimal.valueOf(100)))
                .unpostedSalesAmount(BigDecimal.valueOf(unpostedSalesCents).divide(BigDecimal.valueOf(100)))
                .postingPercentage(BigDecimal.valueOf(postingPercentage).setScale(2, java.math.RoundingMode.HALF_UP))
                .isBalanced(isBalanced)
                .build();
    }

    @Data
    @Builder
    public static class IntegrityReportResponse {
        private Long tenantId;
        private long totalSalesCount;
        private long postedSalesCount;
        private long unpostedSalesCount;
        private BigDecimal totalSalesAmount;
        private BigDecimal postedSalesAmount;
        private BigDecimal unpostedSalesAmount;
        private BigDecimal postingPercentage;
        private boolean isBalanced;
    }
}
