package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.entity.TripVendor;
import com.example.multi_tanent.fleet.service.TripVendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping({"/api/fleet/trip-vendors", "/api/fleet/vendors"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripVendorController {

    private final TripVendorService service;

    @PostMapping
    public ResponseEntity<TripVendor> create(@RequestBody TripVendor vendor) {
        return ResponseEntity.ok(service.createVendor(vendor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripVendor> update(@PathVariable Long id, @RequestBody TripVendor vendor) {
        return ResponseEntity.ok(service.updateVendor(id, vendor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripVendor> getById(@PathVariable Long id) {
        TripVendor v = service.getVendorById(id);
        return v != null ? ResponseEntity.ok(v) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<TripVendor>> getAllActive() {
        return ResponseEntity.ok(service.getAllActive());
    }
}
