package com.example.multi_tanent.sales.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.sales.dto.SalesDashboardResponse;
import com.example.multi_tanent.sales.entity.SalesInvoice;
import com.example.multi_tanent.sales.repository.SalesInvoiceRepository;
import com.example.multi_tanent.sales.repository.SalesOrderRepository;
import com.example.multi_tanent.spersusers.base.PartyBase;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(value = "tenantTx", readOnly = true)
public class SalesDashboardService {

        private final SalesOrderRepository salesOrderRepo;
        private final SalesInvoiceRepository salesInvoiceRepo;
        private final PartyRepository partyRepo;
        private final TenantRepository tenantRepo;

        private Tenant currentTenant() {
                String key = TenantContext.getTenantId();
                return tenantRepo.findByTenantId(key)
                                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
        }

        public SalesDashboardResponse getDashboardData() {
                Tenant t = currentTenant();
                Long tenantId = t.getId();
                NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.US);

                // 1. Stats
                Long newOrders = salesOrderRepo.countByTenantId(tenantId);
                Long newCustomers = partyRepo.countByTenantIdAndPartyType(tenantId, PartyBase.PartyType.CUSTOMER);
                BigDecimal totalRevRaw = salesInvoiceRepo.sumNetTotalByTenantId(tenantId);
                if (totalRevRaw == null)
                        totalRevRaw = BigDecimal.ZERO;
                String totalRevenue = currencyFormat.format(totalRevRaw);

                SalesDashboardResponse.Stats stats = SalesDashboardResponse.Stats.builder()
                                .totalRevenue(totalRevenue)
                                .newOrders(newOrders)
                                .newCustomers(newCustomers)
                                .conversionRate("3.8%") // Placeholder
                                .revenueTrend("12.5%") // Placeholder
                                .ordersTrend("8.2%") // Placeholder
                                .customersTrend("-2.4%") // Placeholder
                                .conversionTrend("4.1%") // Placeholder
                                .build();

                // 2. Trend Data (Monthly Revenue)
                List<SalesDashboardResponse.TrendData> trendData = new ArrayList<>();
                trendData.add(new SalesDashboardResponse.TrendData("Jan", new BigDecimal("4000"),
                                new BigDecimal("2400")));
                trendData.add(new SalesDashboardResponse.TrendData("Feb", new BigDecimal("3000"),
                                new BigDecimal("1398")));
                trendData.add(new SalesDashboardResponse.TrendData("Mar", new BigDecimal("2000"),
                                new BigDecimal("9800")));
                trendData.add(new SalesDashboardResponse.TrendData("Apr", new BigDecimal("2780"),
                                new BigDecimal("3908")));
                trendData.add(new SalesDashboardResponse.TrendData("May", new BigDecimal("1890"),
                                new BigDecimal("4800")));
                trendData.add(new SalesDashboardResponse.TrendData("Jun", new BigDecimal("2390"),
                                new BigDecimal("3800")));
                trendData.add(new SalesDashboardResponse.TrendData("Jul", new BigDecimal("3490"),
                                new BigDecimal("4300")));

                // 3. Category Data
                List<SalesDashboardResponse.CategoryData> categoryData = new ArrayList<>();
                categoryData.add(new SalesDashboardResponse.CategoryData("Services", new BigDecimal("400")));
                categoryData.add(new SalesDashboardResponse.CategoryData("Products", new BigDecimal("300")));
                categoryData.add(new SalesDashboardResponse.CategoryData("Rentals", new BigDecimal("300")));
                categoryData.add(new SalesDashboardResponse.CategoryData("Others", new BigDecimal("200")));

                // 4. Recent Activity (Latest 5 Invoices)
                List<SalesInvoice> recentInvoices = salesInvoiceRepo.findByTenantId(tenantId,
                                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();

                List<SalesDashboardResponse.RecentActivity> recentActivity = recentInvoices.stream()
                                .map(inv -> SalesDashboardResponse.RecentActivity.builder()
                                                .id(inv.getId())
                                                .customer(inv.getCustomer() != null ? inv.getCustomer().getCompanyName()
                                                                : "Unknown")
                                                .amount(inv.getNetTotal().toString())
                                                .status("Paid") // Should map from invoice status if available
                                                .date(inv.getInvoiceDate() != null ? inv.getInvoiceDate().toString()
                                                                : "N/A")
                                                .build())
                                .collect(Collectors.toList());

                // 5. Top Products
                List<SalesDashboardResponse.TopProduct> topProducts = new ArrayList<>();
                topProducts.add(new SalesDashboardResponse.TopProduct("Rental Service", 4000L));
                topProducts.add(new SalesDashboardResponse.TopProduct("Spare Parts", 3000L));
                topProducts.add(new SalesDashboardResponse.TopProduct("Maintenance", 2000L));
                topProducts.add(new SalesDashboardResponse.TopProduct("Consulting", 2780L));
                topProducts.add(new SalesDashboardResponse.TopProduct("Logistics", 1890L));

                return SalesDashboardResponse.builder()
                                .stats(stats)
                                .trendData(trendData)
                                .categoryData(categoryData)
                                .recentActivity(recentActivity)
                                .topProducts(topProducts)
                                .build();
        }
}
