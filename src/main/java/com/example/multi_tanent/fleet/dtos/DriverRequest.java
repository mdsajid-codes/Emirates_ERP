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
public class DriverRequest {

    @NotBlank(message = "Employee code is required")
    private String employeeCode;

    @NotBlank(message = "Driver name is required")
    private String name;

    @NotBlank(message = "Phone index is required")
    private String phone;

    private String email;
    private String address;
    private LocalDate dateOfBirth;
    private LocalDate joiningDate;
    private String emergencyContact;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    private String licenseType;
    private LocalDate licenseExpiry;
    private String emiratesId;
    private LocalDate emiratesIdExpiry;
    private String nationality;
    private LocalDate visaExpiry;
    private String profileImageUrl;
    private String status; // enum string
    private Long assignedVehicleId;
    private Long userId;
    private String password;
    private String notes;
}
