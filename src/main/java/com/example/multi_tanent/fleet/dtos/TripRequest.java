package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.OtherChargeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripRequest {
    // Core
    @NotNull
    private LocalDate tripDate;
    private Long driverId; // Driver ID from Fleet module
    @NotBlank
    private String containerNumber;
    @NotNull
    private Long customerId;
    private String customerRefJobNo;
    private String contactPerson;
    private String customerType; // COMPANY or INDIVIDUAL
    @NotBlank
    private String fromLocation;
    @NotBlank
    private String toLocation;
    private Long routeId;
    private String remarks;
    private LocalDateTime startTime;
    private LocalDateTime estimatedEndTime;
    private String cargoType;
    private BigDecimal loadWeightKg;
    private Long vehicleId;

    // Charges (goes to trip_charges table)
    @NotNull
    private BigDecimal amount;
    private BigDecimal tokenAmount;
    private BigDecimal otherCharges;
    private OtherChargeType otherChargeType;

    // Vendor assignment (optional — creates trip_vendor_assignment row if provided)
    private Long vendorId;
    private BigDecimal vendorAmount;

    // Payment info (optional — creates trip_payment row if provided)
    private String receivedBy;
    private String tokenPaymentMethod; // CASH, CARD, BANK_TRANSFER
    private String chequeNumber;
    private String otherReference;
}
