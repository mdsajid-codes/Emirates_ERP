package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.FuelEntryRequest;
import com.example.multi_tanent.fleet.dtos.FuelEntryResponse;
import com.example.multi_tanent.fleet.service.FuelEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/fleet/fuel")
@RequiredArgsConstructor
public class FuelEntryController {

    private final FuelEntryService fuelEntryService;

    @PostMapping
    public ResponseEntity<FuelEntryResponse> createEntry(@RequestBody FuelEntryRequest request) {
        return ResponseEntity.ok(fuelEntryService.createEntry(request));
    }

    @GetMapping
    public ResponseEntity<Page<FuelEntryResponse>> listAll(
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) Long tripId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(fuelEntryService.listAll(vehicleId, tripId, startDate, endDate, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuelEntryResponse> getEntry(@PathVariable Long id) {
        return ResponseEntity.ok(fuelEntryService.getEntry(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuelEntryResponse> updateEntry(@PathVariable Long id, @RequestBody FuelEntryRequest request) {
        return ResponseEntity.ok(fuelEntryService.updateEntry(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        fuelEntryService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/receipt")
    public ResponseEntity<FuelEntryResponse> uploadReceipt(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(fuelEntryService.uploadReceipt(id, file));
    }
}
