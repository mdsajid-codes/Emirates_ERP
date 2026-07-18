package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.sales.entity.DeliveryOrder;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fleet_route_stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_order_id")
    private DeliveryOrder deliveryOrder;

    @Column(name = "stop_order")
    private Integer stopOrder;

    @Column(name = "customer_name")
    private String customerName;

    private String address;

    private Double latitude;
    private Double longitude;

    @Column(name = "estimated_arrival")
    private LocalDateTime estimatedArrival;

    @Column(name = "actual_arrival")
    private LocalDateTime actualArrival;

    private String status; // PENDING, ARRIVED, COMPLETED, SKIPPED

    private String notes;
}
