package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.RackRequest;
import com.example.multi_tanent.warehouse.dto.RackResponse;
import com.example.multi_tanent.warehouse.enums.RackType;
import com.example.multi_tanent.warehouse.service.RackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/racks")
@RequiredArgsConstructor
public class RackController {

    private final RackService rackService;

    @GetMapping
    public ResponseEntity<List<RackResponse>> getAllRacks() {
        return ResponseEntity.ok(rackService.getAllRacks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RackResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(rackService.getById(id));
    }

    @GetMapping("/status")
    public ResponseEntity<List<RackResponse>> getByActive(@RequestParam Boolean isActive) {
        return ResponseEntity.ok(rackService.fetchByActive(isActive));
    }

    @GetMapping("/type/{rackType}")
    public ResponseEntity<List<RackResponse>> getByRackType(@PathVariable RackType rackType) {
        return ResponseEntity.ok(rackService.fetchByRackType(rackType));
    }

    @GetMapping("/barcode/{barcodeTag}")
    public ResponseEntity<RackResponse> getByBarcodeTag(@PathVariable String barcodeTag) {
        return ResponseEntity.ok(rackService.fetchByBarcodeTag(barcodeTag));
    }

    @PostMapping
    public ResponseEntity<RackResponse> create(@RequestBody RackRequest request) {
        return new ResponseEntity<>(rackService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RackResponse> update(@PathVariable Long id, @RequestBody RackRequest request) {
        return ResponseEntity.ok(rackService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rackService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
