package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.VehicleMaintenanceRequest;
import com.example.multi_tanent.fleet.dtos.VehicleMaintenanceResponse;
import com.example.multi_tanent.fleet.enums.MaintenanceStatus;
import com.example.multi_tanent.fleet.service.VehicleMaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/fleet/maintenance")
@RequiredArgsConstructor
public class VehicleMaintenanceController {

    private final VehicleMaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<VehicleMaintenanceResponse> createRequest(@RequestBody VehicleMaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceService.createRequest(request));
    }

    @GetMapping
    public ResponseEntity<Page<VehicleMaintenanceResponse>> listAll(
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) Long tripId,
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(maintenanceService.listAll(status, tripId, vehicleId, search, pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VehicleMaintenanceResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam MaintenanceStatus status) {
        return ResponseEntity.ok(maintenanceService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<VehicleMaintenanceResponse> completeRequest(
            @PathVariable Long id,
            @RequestParam BigDecimal actualCost,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(maintenanceService.completeRequest(id, actualCost, notes));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleMaintenanceResponse> updateRecord(
            @PathVariable Long id,
            @RequestBody VehicleMaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceService.updateRecord(id, request));
    }

    @PostMapping("/{id}/invoice")
    public ResponseEntity<VehicleMaintenanceResponse> uploadInvoice(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(maintenanceService.uploadInvoice(id, file));
    }
}
