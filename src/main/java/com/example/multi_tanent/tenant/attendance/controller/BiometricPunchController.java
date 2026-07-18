package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.entity.AttendanceRecord;
import com.example.multi_tanent.tenant.attendance.entity.BiometricDevice;
import com.example.multi_tanent.tenant.attendance.entity.RawBiometricPunch;
import com.example.multi_tanent.tenant.attendance.repository.BiometricDeviceRepository;
import com.example.multi_tanent.tenant.attendance.service.AttendanceRecordService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/biometric-punch")
@CrossOrigin(origins = "*")
public class BiometricPunchController {

    private final AttendanceRecordService attendanceService;
    private final BiometricDeviceRepository deviceRepository;
    private final ObjectMapper objectMapper;

    public BiometricPunchController(AttendanceRecordService attendanceService, 
                                   BiometricDeviceRepository deviceRepository,
                                   ObjectMapper objectMapper) {
        this.attendanceService = attendanceService;
        this.deviceRepository = deviceRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Standardized endpoint for all biometric devices.
     * Authentication and Tenant resolution are handled by BiometricTenantFilter via X-API-KEY.
     */
    @PostMapping
    public ResponseEntity<?> recordPunch(@RequestBody String rawPayload) {
        try {
            // 1. Identify device from payload (Generic approach)
            // Most devices send their serial number as 'device_sn' or 'sn'
            JsonNode node = objectMapper.readTree(rawPayload);
            String sn = node.has("deviceIdentifier") && !node.get("deviceIdentifier").isNull() ? node.get("deviceIdentifier").asText() :
                        node.has("device_sn") && !node.get("device_sn").isNull() ? node.get("device_sn").asText() : 
                        node.has("sn") && !node.get("sn").isNull() ? node.get("sn").asText() : null;

            if (sn == null) {
                return ResponseEntity.badRequest().body("Device serial number (sn) missing in payload");
            }

            BiometricDevice device = deviceRepository.findByDeviceIdentifier(sn)
                    .orElseThrow(() -> new RuntimeException("Device not registered: " + sn));

            // 2. Log raw punch immediately
            RawBiometricPunch rawPunch = RawBiometricPunch.builder()
                    .device(device)
                    .rawPayload(rawPayload)
                    .processingStatus("PENDING")
                    .build();

            // 3. Process
            AttendanceRecord record = attendanceService.processRawPunch(rawPunch);
            
            return ResponseEntity.ok(java.util.Map.of(
                "status", "success",
                "message", "Punch recorded for " + record.getEmployee().getName(),
                "checkIn", record.getCheckIn() != null ? record.getCheckIn().toString() : "N/A",
                "checkOut", record.getCheckOut() != null ? record.getCheckOut().toString() : "N/A"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Punch processing failed: " + e.getMessage());
        }
    }

    /**
     * Legacy endpoint for compatibility.
     */
    @PostMapping("/{tenantId}")
    public ResponseEntity<?> recordPunchLegacy(@PathVariable String tenantId, @RequestBody String rawPayload) {
        // BiometricTenantFilter already set the context if it was in the path
        return recordPunch(rawPayload);
    }
}