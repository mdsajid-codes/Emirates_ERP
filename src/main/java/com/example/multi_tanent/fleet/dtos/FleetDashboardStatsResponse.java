package com.example.multi_tanent.fleet.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FleetDashboardStatsResponse {
    // Financials
    private BigDecimal totalRevenueMTD;
    private BigDecimal totalRevenueYTD;
    private BigDecimal totalExpensesMTD;
    private BigDecimal totalExpensesYTD;

    // Assets
    private long totalVehiclesCount;
    private long activeVehiclesCount;
    private long maintenanceVehiclesCount;
    private long activeDriversCount;

    // Operations
    private long tripsTodayCount;
    private double onTimeDeliveryPercentage;
    private double fleetUtilizationPercentage;
    private double avgFuelEfficiency; // km/L

    // Alerts/Pending
    private long pendingComplaintsCount;
    private long expiringDocumentsCount;
}
