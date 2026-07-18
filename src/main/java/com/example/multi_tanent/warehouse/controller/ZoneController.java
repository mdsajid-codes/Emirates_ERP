package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.ZoneRequest;
import com.example.multi_tanent.warehouse.dto.ZoneResponse;
import com.example.multi_tanent.warehouse.enums.ZoneType;
import com.example.multi_tanent.warehouse.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @GetMapping
    public ResponseEntity<List<ZoneResponse>> getAllZones() {
        return ResponseEntity.ok(zoneService.getAllZones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ZoneResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(zoneService.getById(id));
    }

    @GetMapping("/status")
    public ResponseEntity<List<ZoneResponse>> getByActive(@RequestParam Boolean isActive) {
        return ResponseEntity.ok(zoneService.fetchByActive(isActive));
    }

    @GetMapping("/type/{zoneType}")
    public ResponseEntity<List<ZoneResponse>> getByZoneType(@PathVariable ZoneType zoneType) {
        return ResponseEntity.ok(zoneService.fetchByZoneType(zoneType));
    }

    @PostMapping
    public ResponseEntity<ZoneResponse> create(@RequestBody ZoneRequest request) {
        return new ResponseEntity<>(zoneService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ZoneResponse> update(@PathVariable Long id, @RequestBody ZoneRequest request) {
        return ResponseEntity.ok(zoneService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        zoneService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
