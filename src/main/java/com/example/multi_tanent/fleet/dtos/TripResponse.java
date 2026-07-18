package com.example.multi_tanent.fleet.dtos;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripResponse {
    // Core trip fields
    private Long id;
    private Integer tripNo;
    private LocalDate tripDate;
    private String tripMonth;
    private String tripStatus;
    private String containerNumber;
    private String fromLocation;
    private String toLocation;
    private Long routeId;
    private String routeName;
    private String remarks;
    private OffsetDateTime createdAt;
    private LocalDateTime startTime;
    private LocalDateTime estimatedEndTime;
    private String cargoType;
    private BigDecimal loadWeightKg;
    private Long vehicleId;
    private String vehiclePlateNumber;

    // Driver
    private Long driverId;
    private String driverName;

    // Customer
    private Long customerId;
    private String customerName;
    private String customerRefJobNo;
    private String contactPerson;

    // Charges
    private BigDecimal amount;
    private BigDecimal tokenAmount;
    private BigDecimal otherCharges;
    private String otherChargeType;
    private BigDecimal vatAmount;
    private BigDecimal totalAmount;
    private BigDecimal driverCommission;

    // Payment
    private String paymentStatus;
    private LocalDate paymentDate;
    private String receivedBy;

    // Vendor
    private Long vendorId;
    private String vendorName;
    private BigDecimal vendorAmount;
    private String vendorPaymentStatus;

    // Invoice link
    private Long invoiceId;
    private String invoiceNumber;

    // Route Stops
    private List<RouteResponse.RouteStopResponse> routeStops;
}
