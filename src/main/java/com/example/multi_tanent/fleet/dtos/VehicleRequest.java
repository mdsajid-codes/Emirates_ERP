package com.example.multi_tanent.fleet.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {

    @NotBlank(message = "Plate number is required")
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
    private String vehicleStatus; // Enum string
    private Double capacityWeight;
    private Double capacityVolume;
    private Double odometerReading;
    private String insuranceNumber;
    private LocalDate insuranceExpiry;
    private LocalDate registrationExpiry;
    private Long assignedDriverId;
    private String notes;
    private Boolean isActive;
}
