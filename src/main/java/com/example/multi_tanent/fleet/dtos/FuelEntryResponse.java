package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.FuelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelEntryResponse {
    private Long id;
    private Long vehicleId;
    private String vehiclePlateNumber;
    private String vehicleMakeModel;
    private Long driverId;
    private String driverName;
    private LocalDate fuelDate;
    private String fuelStation;
    private FuelType fuelType;
    private BigDecimal quantityLiters;
    private BigDecimal amountAed;
    private Double odometerReading;
    private String receiptPath;
    private String notes;
    private Long tripId;
    private String tripNo;
    private OffsetDateTime createdAt;
}
