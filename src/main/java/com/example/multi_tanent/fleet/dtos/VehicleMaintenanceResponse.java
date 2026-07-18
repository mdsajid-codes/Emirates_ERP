package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.MaintenanceStatus;
import com.example.multi_tanent.fleet.enums.MaintenanceType;
import com.example.multi_tanent.fleet.enums.ServiceCategory;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleMaintenanceResponse {
    private Long id;
    private Long vehicleId;
    private String vehiclePlateNumber;
    private String vehicleMakeModel;
    private Long tripId;
    private String tripNo;
    private MaintenanceType maintenanceType;
    private ServiceCategory serviceCategory;
    private LocalDate requestedDate;
    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private String garage;
    private Double odometerAtService;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private MaintenanceStatus status;
    private String serviceNotes;
    private String spareParts;
    private String invoicePath;
    private OffsetDateTime createdAt;
}
