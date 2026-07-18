package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.purchases.dto.PurDashboardResponse;
import com.example.multi_tanent.purchases.entity.PurPurchaseOrder;
import com.example.multi_tanent.purchases.repository.PurPurchaseInvoiceRepository;
import com.example.multi_tanent.purchases.repository.PurPurchaseOrderRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(value = "tenantTx", readOnly = true)
public class PurDashboardService {

        private final PurPurchaseOrderRepository poRepo;
        private final PurPurchaseInvoiceRepository invoiceRepo;
        private final PartyRepository supplierRepo;
        private final TenantRepository tenantRepo;

        private Tenant currentTenant() {
                String key = TenantContext.getTenantId();
                return tenantRepo.findByTenantId(key)
                                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
        }

        public PurDashboardResponse getDashboardData() {
                Tenant t = currentTenant();
                Long tenantId = t.getId();

                // 1. Stats
                Long totalOrders = poRepo.countByTenantId(tenantId);
                Long totalBills = invoiceRepo.countByTenantId(tenantId);

                // Sum net_total from invoices for outstanding payment
                // (This is a simplified version, ideally you'd subtract paid amounts)
                BigDecimal outstandingPayment = invoiceRepo.sumNetTotalByTenantId(tenantId);
                if (outstandingPayment == null)
                        outstandingPayment = BigDecimal.ZERO;

                Long activeSuppliers = supplierRepo.countByTenantId(tenantId);

                PurDashboardResponse.Stats stats = PurDashboardResponse.Stats.builder()
                                .totalOrders(totalOrders)
                                .totalBills(totalBills)
                                .outstandingPayment(outstandingPayment)
                                .activeSuppliers(activeSuppliers)
                                .build();

                // 2. Trend Data (Placeholders for now)
                List<PurDashboardResponse.TrendData> trendData = new ArrayList<>();
                trendData.add(new PurDashboardResponse.TrendData("Jan", 10L, 8L));
                trendData.add(new PurDashboardResponse.TrendData("Feb", 15L, 12L));
                trendData.add(new PurDashboardResponse.TrendData("Mar", 8L, 7L));

                // 3. Recent Activity (Latest 5 Purchase Orders)
                List<PurPurchaseOrder> recentPOs = poRepo.findByTenantId(tenantId,
                                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();

                List<PurDashboardResponse.RecentActivity> recentActivity = recentPOs.stream()
                                .map(po -> PurDashboardResponse.RecentActivity.builder()
                                                .id(po.getId())
                                                .type("Order")
                                                .number(po.getPoNumber())
                                                .supplier(po.getSupplier() != null ? po.getSupplier().getCompanyName()
                                                                : "Unknown")
                                                .amount(po.getTotalAmount())
                                                .date(po.getDate() != null ? po.getDate().toString() : "N/A")
                                                .status(po.getStatus())
                                                .build())
                                .collect(Collectors.toList());

                return PurDashboardResponse.builder()
                                .stats(stats)
                                .trendData(trendData)
                                .recentActivity(recentActivity)
                                .build();
        }
}
