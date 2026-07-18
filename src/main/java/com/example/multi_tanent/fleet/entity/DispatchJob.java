package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.fleet.enums.DeliveryStatus;
import com.example.multi_tanent.fleet.enums.DispatchPriority;
import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.entity.Vehicle;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.fleet.entity.Trip;
import com.example.multi_tanent.fleet.entity.TripCustomer;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "dispatch_jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispatchJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "job_no", nullable = false)
    private String jobNo;

    @Column(name = "job_date", nullable = false)
    private LocalDate jobDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private TripCustomer customer;

    @Column(name = "pickup_location")
    private String pickupLocation;

    @Column(name = "drop_location")
    private String dropLocation;

    @Column(name = "cargo_details")
    private String cargoDetails;

    @Column(name = "load_weight")
    private Double loadWeight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DispatchPriority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_vehicle_id")
    private Vehicle assignedVehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_driver_id")
    private Driver assignedDriver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_trip_id")
    private Trip linkedTrip;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false)
    private DeliveryStatus deliveryStatus;

    @Column(name = "proof_of_delivery_path")
    private String proofOfDeliveryPath;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    @Column(length = 1000)
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
