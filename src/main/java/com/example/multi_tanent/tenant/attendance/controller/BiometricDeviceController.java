package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.dto.BiometricDeviceRequest;
import com.example.multi_tanent.tenant.attendance.entity.BiometricDevice;
import com.example.multi_tanent.tenant.attendance.service.BiometricDeviceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/biometric-devices")
@CrossOrigin(origins = "*")
public class BiometricDeviceController {
    private final BiometricDeviceService deviceService;

    public BiometricDeviceController(BiometricDeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<BiometricDevice> createDevice(@RequestBody BiometricDeviceRequest request) {
        BiometricDevice createdDevice = deviceService.createDevice(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdDevice.getId()).toUri();
        return ResponseEntity.created(location).body(createdDevice);
    }

    @GetMapping
    public ResponseEntity<List<BiometricDevice>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BiometricDevice> getDeviceById(@PathVariable Long id) {
        return deviceService.getDeviceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<BiometricDevice> updateDevice(@PathVariable Long id, @RequestBody BiometricDeviceRequest request) {
        BiometricDevice updatedDevice = deviceService.updateDevice(id, request);
        return ResponseEntity.ok(updatedDevice);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/commands")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> issueCommand(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String commandType = body.get("commandType");
        String payload = body.get("payload");
        return ResponseEntity.ok(deviceService.issueCommand(id, commandType, payload));
    }
}
