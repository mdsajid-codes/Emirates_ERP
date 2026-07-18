package com.example.multi_tanent.fleet.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DriverPerformanceRequest {
    private Long driverId;
    private String evaluationPeriod; // e.g. "2026-05"
    private Integer tripsCompleted;
    private Double onTimeDeliveryPercent;
    private Integer incidentsCount;
    private Double fuelEfficiencyScore;
    private BigDecimal incentiveAmount;
    private BigDecimal penaltyAmount;
    private String remarks;
}
