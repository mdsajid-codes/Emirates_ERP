package com.example.multi_tanent.fleet.dtos;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RouteRequest {
    private String routeName;
    private Long driverId;
    private Long vehicleId;
    private LocalDate routeDate;
    private String status; // PLANNED, IN_PROGRESS, COMPLETED
    private Double totalDistanceKm;
    private Integer estimatedDurationMins;
    private List<RouteStopRequest> stops;

    @Data
    public static class RouteStopRequest {
        private Long deliveryOrderId;
        private Integer stopOrder;
        private String customerName;
        private String address;
        private Double latitude;
        private Double longitude;
        private LocalDateTime estimatedArrival;
    }
}
