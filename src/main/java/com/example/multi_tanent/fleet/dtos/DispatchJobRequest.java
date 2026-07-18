package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.DispatchPriority;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispatchJobRequest {
    private LocalDate jobDate;
    private Long customerId;
    private String pickupLocation;
    private String dropLocation;
    private String cargoDetails;
    private Double loadWeight;
    private DispatchPriority priority;
    private String remarks;
    private Long linkedTripId;
}
