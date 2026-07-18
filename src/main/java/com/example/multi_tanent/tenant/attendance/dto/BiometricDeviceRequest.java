package com.example.multi_tanent.tenant.attendance.dto;

import lombok.Data;

@Data
public class BiometricDeviceRequest {
    private String name;
    private String machineNumber;
    private String deviceIdentifier;
    private String deviceType;
    private String ipAddress;
    private Integer port;
    private String siteLattitude;
    private String siteLongitude;
    private String location;
    private String apiKey;
    private String vendorFormat;
    private Boolean active;
}