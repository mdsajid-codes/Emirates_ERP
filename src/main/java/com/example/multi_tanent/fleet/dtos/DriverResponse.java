package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.DriverStatus;
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
public class DriverResponse {

    private Long id;
    private String employeeCode;
    private String name;
    private String phone;
    private String email;
    private String address;
    private LocalDate dateOfBirth;
    private LocalDate joiningDate;
    private String emergencyContact;
    private String licenseNumber;
    private String licenseType;
    private LocalDate licenseExpiry;
    private String emiratesId;
    private LocalDate emiratesIdExpiry;
    private String nationality;
    private LocalDate visaExpiry;
    private String profileImageUrl;
    private DriverStatus status;
    private Long userId;
    private Long assignedVehicleId;
    private String assignedVehiclePlateNumber;
    private Boolean isActive;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
