package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.MaintenanceType;
import com.example.multi_tanent.fleet.enums.ServiceCategory;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleMaintenanceRequest {
    private Long vehicleId;
    private MaintenanceType maintenanceType;
    private ServiceCategory serviceCategory;
    private LocalDate requestedDate;
    private LocalDate scheduledDate;
    private String garage;
    private Double odometerAtService;
    private BigDecimal estimatedCost;
    private String serviceNotes;
    private String spareParts;
    private Long tripId;
}
