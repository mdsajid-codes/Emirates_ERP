package com.example.multi_tanent.fleet.dtos;

import lombok.Data;

@Data
public class DispatchAssignRequest {
    private Long vehicleId;
    private Long driverId;
    private Long tripId; // Optional: can link to an existing trip
}
