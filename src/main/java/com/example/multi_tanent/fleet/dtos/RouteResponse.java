package com.example.multi_tanent.fleet.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponse {
    
    private Long id;
    private String routeName;
    private Long driverId;
    private String driverName;
    private Long vehicleId;
    private String vehiclePlateNumber;
    private LocalDate routeDate;
    private String status;
    private String fromLocation;
    private String toLocation;
    private Double totalDistanceKm;
    private Integer estimatedDurationMins;
    private List<RouteStopResponse> stops;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteStopResponse {
        private Long id;
        private Long deliveryOrderId;
        private String deliveryOrderNumber;
        private Integer stopOrder;
        private String customerName;
        private String address;
        private Double latitude;
        private Double longitude;
        private LocalDateTime estimatedArrival;
        private LocalDateTime actualArrival;
        private String status;
        private String notes;
    }
}
