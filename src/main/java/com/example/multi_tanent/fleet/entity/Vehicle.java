package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.fleet.enums.VehicleStatus;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fleet_vehicles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tenant_id", "plate_number"}),
        @UniqueConstraint(columnNames = {"tenant_id", "engine_number"}),
        @UniqueConstraint(columnNames = {"tenant_id", "vin_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plate_number", nullable = false)
    private String plateNumber;

    @Column(name = "vehicle_type")
    private String vehicleType;

    private String make;

    private String model;

    private Integer year;

    private String color;

    @Column(name = "vin_number")
    private String vinNumber;

    @Column(name = "engine_number")
    private String engineNumber;

    @Column(name = "fuel_type")
    private String fuelType;

    @Column(name = "yard_location")
    private String yardLocation;

    @Column(name = "permit_expiry")
    private LocalDate permitExpiry;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_status")
    @Builder.Default
    private VehicleStatus vehicleStatus = VehicleStatus.ACTIVE;

    @Column(name = "capacity_weight")
    private Double capacityWeight;

    @Column(name = "capacity_volume")
    private Double capacityVolume;

    @Column(name = "odometer_reading")
    private Double odometerReading;

    @Column(name = "insurance_number")
    private String insuranceNumber;

    @Column(name = "insurance_expiry")
    private LocalDate insuranceExpiry;

    @Column(name = "registration_expiry")
    private LocalDate registrationExpiry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_driver_id")
    private Driver assignedDriver;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant enterprise;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
