package com.example.multi_tanent.fleet.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class DriverPerformanceResponse {
    private Long id;
    private Long driverId;
    private String driverName;
    private String evaluationPeriod;
    private Integer tripsCompleted;
    private Double onTimeDeliveryPercent;
    private Integer incidentsCount;
    private Double fuelEfficiencyScore;
    private BigDecimal incentiveAmount;
    private BigDecimal penaltyAmount;
    private String remarks;
    private OffsetDateTime createdAt;
}
