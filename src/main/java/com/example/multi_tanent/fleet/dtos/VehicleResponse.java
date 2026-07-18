package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {

    private Long id;
    private String plateNumber;
    private String vehicleType;
    private String make;
    private String model;
    private Integer year;
    private String color;
    private String vinNumber;
    private String engineNumber;
    private String fuelType;
    private String yardLocation;
    private LocalDate permitExpiry;
    private VehicleStatus vehicleStatus;
    private Double capacityWeight;
    private Double capacityVolume;
    private Double odometerReading;
    private String insuranceNumber;
    private LocalDate insuranceExpiry;
    private LocalDate registrationExpiry;
    private Long assignedDriverId;
    private String assignedDriverName;
    private Boolean isActive;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
