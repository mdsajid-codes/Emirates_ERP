package com.example.multi_tanent.purchases.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurDashboardResponse {
    private Stats stats;
    private List<TrendData> trendData;
    private List<RecentActivity> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stats {
        private Long totalOrders;
        private Long totalBills;
        private BigDecimal outstandingPayment;
        private Long activeSuppliers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendData {
        private String month;
        private Long orders;
        private Long bills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private Long id;
        private String type;
        private String number;
        private String supplier;
        private BigDecimal amount;
        private String date;
        private String status;
    }
}
