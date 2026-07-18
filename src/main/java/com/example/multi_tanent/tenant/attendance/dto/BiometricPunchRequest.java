package com.example.multi_tanent.tenant.attendance.dto;

import lombok.Data;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;

@Data
public class BiometricPunchRequest {
    @JsonAlias({"device_sn", "sn"})
    private String deviceIdentifier; // Serial number of the device
    
    private String device_sn; // explicitly capture this for fallback
    private String sn; // explicitly capture this for fallback
    
    private String biometricIdentifier; // The ID from the device (e.g., fingerprint ID, card ID)
    
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime punchTime; // The timestamp of the punch from the device

    public String getDeviceIdentifier() {
        if (deviceIdentifier != null && !deviceIdentifier.trim().isEmpty()) {
            return deviceIdentifier;
        }
        if (device_sn != null && !device_sn.trim().isEmpty()) {
            return device_sn;
        }
        return sn;
    }
}