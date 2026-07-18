package com.example.multi_tanent.sales.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesDashboardResponse {
    private Stats stats;
    private List<TrendData> trendData;
    private List<CategoryData> categoryData;
    private List<RecentActivity> recentActivity;
    private List<TopProduct> topProducts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stats {
        private String totalRevenue;
        private Long newOrders;
        private Long newCustomers;
        private String conversionRate;
        private String revenueTrend;
        private String ordersTrend;
        private String customersTrend;
        private String conversionTrend;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendData {
        private String name;
        private BigDecimal revenue;
        private BigDecimal expenses;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryData {
        private String name;
        private BigDecimal value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private Long id;
        private String customer;
        private String amount;
        private String status;
        private String date;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopProduct {
        private String name;
        private Long sales;
    }
}
