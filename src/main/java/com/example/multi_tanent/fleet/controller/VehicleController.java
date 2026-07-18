package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.VehicleRequest;
import com.example.multi_tanent.fleet.dtos.VehicleResponse;
import com.example.multi_tanent.fleet.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fleet/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleRequest request) {
        return new ResponseEntity<>(vehicleService.createVehicle(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(@PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicle(id));
    }

    @GetMapping
    public ResponseEntity<Page<VehicleResponse>> listVehicles(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(vehicleService.listVehicles(search, pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<VehicleResponse>> listAllVehicles() {
        return ResponseEntity.ok(vehicleService.listAllVehicles());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<com.example.multi_tanent.fleet.dtos.VehicleDocumentResponse> uploadDocument(
            @PathVariable Long id,
            @RequestParam com.example.multi_tanent.fleet.enums.VehicleDocumentType type,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate expiryDate,
            @RequestParam org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(vehicleService.uploadDocument(id, type, expiryDate, file));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<java.util.List<com.example.multi_tanent.fleet.dtos.VehicleDocumentResponse>> listDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getDocuments(id));
    }
}
