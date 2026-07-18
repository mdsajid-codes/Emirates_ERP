package com.example.multi_tanent.tenant.attendance.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "biometric_devices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiometricDevice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "device_identifier")
    private String deviceIdentifier; // e.g., serial number

    @Column(name = "name")
    private String name;

    @Column(name = "machine_number")
    private String machineNumber;

    @Column(name = "device_type")
    private String deviceType; // Fingerprint, Face

    @Column(name = "ip_address")
    private String ipAddress;
    private Integer port;

    @Column(name = "site_lattitude")
    private String siteLattitude;
    @Column(name = "site_longitude")
    private String siteLongitude;

    @Column(name = "location")
    private String location; // office or gate location

    @Column(name = "api_key", unique = true)
    private String apiKey;

    @Column(name = "vendor_format")
    private String vendorFormat; // e.g., ZKTECO, ESSL, GENERIC

    @Column(name = "active")
    private Boolean active;
}
