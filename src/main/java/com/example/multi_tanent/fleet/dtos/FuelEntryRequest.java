package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.FuelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelEntryRequest {
    private Long vehicleId;
    private Long driverId;
    private LocalDate fuelDate;
    private String fuelStation;
    private FuelType fuelType;
    private BigDecimal quantityLiters;
    private BigDecimal amountAed;
    private Double odometerReading;
    private Long tripId;
    private String notes;
}
