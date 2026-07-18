package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.WareHouseRequest;
import com.example.multi_tanent.warehouse.dto.WareHouseResponse;
import com.example.multi_tanent.warehouse.enums.WarehouseType;
import com.example.multi_tanent.warehouse.service.WareHouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/warehouses")
@RequiredArgsConstructor
public class WareHouseController {

    private final WareHouseService warehouseService;

    @GetMapping
    public ResponseEntity<List<WareHouseResponse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WareHouseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<WareHouseResponse> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(warehouseService.getByCode(code));
    }

    @GetMapping("/status")
    public ResponseEntity<List<WareHouseResponse>> getByActive(@RequestParam Boolean isActive) {
        return ResponseEntity.ok(warehouseService.fetchByActive(isActive));
    }

    @GetMapping("/type/{warehouseType}")
    public ResponseEntity<List<WareHouseResponse>> getByWarehouseType(@PathVariable WarehouseType warehouseType) {
        return ResponseEntity.ok(warehouseService.fetchByWarehouseType(warehouseType));
    }

    @PostMapping
    public ResponseEntity<WareHouseResponse> create(@RequestBody WareHouseRequest request) {
        return new ResponseEntity<>(warehouseService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WareHouseResponse> update(@PathVariable Long id, @RequestBody WareHouseRequest request) {
        return ResponseEntity.ok(warehouseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        warehouseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
