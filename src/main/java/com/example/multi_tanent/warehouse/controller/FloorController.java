package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.FloorRequest;
import com.example.multi_tanent.warehouse.dto.FloorResponse;
import com.example.multi_tanent.warehouse.service.FloorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/floors")
@RequiredArgsConstructor
public class FloorController {

    private final FloorService floorService;

    @GetMapping
    public ResponseEntity<List<FloorResponse>> getAllFloors() {
        return ResponseEntity.ok(floorService.getAllFloors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FloorResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(floorService.getById(id));
    }

    @GetMapping("/status")
    public ResponseEntity<List<FloorResponse>> getByActive(@RequestParam Boolean isActive) {
        return ResponseEntity.ok(floorService.fetchByActive(isActive));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<FloorResponse>> getByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(floorService.fetchByWarehouse(warehouseId));
    }

    @PostMapping
    public ResponseEntity<FloorResponse> create(@RequestBody FloorRequest request) {
        return new ResponseEntity<>(floorService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FloorResponse> update(@PathVariable Long id, @RequestBody FloorRequest request) {
        return ResponseEntity.ok(floorService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        floorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
