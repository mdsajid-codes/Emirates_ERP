package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.entity.TripVendor;
import com.example.multi_tanent.fleet.service.TripVendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fleet/trip-vendors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripVendorController {

    private final TripVendorService service;

    @PostMapping
    public ResponseEntity<TripVendor> create(@RequestBody TripVendor vendor) {
        return ResponseEntity.ok(service.createVendor(vendor));
    }

    @GetMapping
    public ResponseEntity<List<TripVendor>> getAllActive() {
        return ResponseEntity.ok(service.getAllActive());
    }
}
