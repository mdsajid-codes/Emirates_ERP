package com.example.multi_tanent.fleet.dtos;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDashboardDataDTO {
    
    // Summary Cards
    private BigDecimal totalRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal netProfit;
    private Double fleetUtilizationRate;
    
    // Operational Metrics
    private Integer totalTrips;
    private Double onTimeDeliveryPercentage;
    private Integer activeIncidents;
    
    // Asset Metrics
    private Double averageFuelEfficiency; // km per liter
    private BigDecimal totalMaintenanceCost;
    private BigDecimal totalFuelCost;
    
    // Charts Data
    private List<FinancialTrendDTO> financialTrends; // 6 month trend
    private List<DriverPerformanceScoreDTO> topDrivers;
    
    // Detailed Table Data
    private List<DriverReportRow> driverPerformance;
    private List<CustomerReportRow> customerBilling;
    private List<VendorReportRow> vendorLiabilities;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FinancialTrendDTO {
        private String month;
        private BigDecimal revenue;
        private BigDecimal expenses;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DriverPerformanceScoreDTO {
        private Long driverId;
        private String driverName;
        private Double performanceScore; // 1-5
        private BigDecimal totalCommission;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DriverReportRow {
        private Long driverId;
        private String name;
        private Long totalTrips;
        private BigDecimal totalAmount;
        private BigDecimal totalCommission;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerReportRow {
        private Long customerId;
        private String name;
        private Long totalTrips;
        private BigDecimal totalAmount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorReportRow {
        private Long vendorId;
        private String name;
        private Long totalTrips;
        private BigDecimal totalAmount;
    }
}
