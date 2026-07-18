package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.DeliveryStatus;
import com.example.multi_tanent.fleet.enums.DispatchPriority;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispatchJobResponse {
    private Long id;
    private String jobNo;
    private LocalDate jobDate;
    private Long customerId;
    private String customerName;
    private String pickupLocation;
    private String dropLocation;
    private String cargoDetails;
    private Double loadWeight;
    private DispatchPriority priority;
    private Long assignedVehicleId;
    private String assignedVehiclePlate;
    private Long assignedDriverId;
    private String assignedDriverName;
    private Long linkedTripId;
    private String linkedTripNo;
    private DeliveryStatus deliveryStatus;
    private String proofOfDeliveryPath;
    private OffsetDateTime deliveredAt;
    private String remarks;
    private OffsetDateTime createdAt;
}
