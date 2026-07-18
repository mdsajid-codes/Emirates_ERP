package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.InventoryImprovementRequest;
import com.example.multi_tanent.warehouse.dto.InventoryImprovementResponse;
import com.example.multi_tanent.warehouse.service.InventoryImprovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/inventory-movements")
@RequiredArgsConstructor
public class InventoryImprovementController {

    private final InventoryImprovementService inventoryImprovementService;

    @GetMapping
    public ResponseEntity<List<InventoryImprovementResponse>> getAll() {
        return ResponseEntity.ok(inventoryImprovementService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryImprovementResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryImprovementService.getById(id));
    }

    @PostMapping
    public ResponseEntity<InventoryImprovementResponse> create(@RequestBody InventoryImprovementRequest request) {
        return new ResponseEntity<>(inventoryImprovementService.create(request), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryImprovementService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InventoryImprovementResponse>> getByStatus(
            @PathVariable com.example.multi_tanent.warehouse.enums.StockStatus status) {
        return ResponseEntity.ok(inventoryImprovementService.getByStatus(status));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<InventoryImprovementResponse>> getByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(inventoryImprovementService.getByWarehouse(warehouseId));
    }

    @PatchMapping("/{id}/quantity")
    public ResponseEntity<InventoryImprovementResponse> updateQuantity(
            @PathVariable Long id,
            @RequestParam Double quantity) {
        return ResponseEntity.ok(inventoryImprovementService.updateQuantity(id, quantity));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<InventoryImprovementResponse>> getByType(
            @PathVariable com.example.multi_tanent.warehouse.enums.MovementType type) {
        return ResponseEntity.ok(inventoryImprovementService.getByType(type));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InventoryImprovementResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam com.example.multi_tanent.warehouse.enums.StockStatus status) {
        return ResponseEntity.ok(inventoryImprovementService.updateStatus(id, status));
    }
}
