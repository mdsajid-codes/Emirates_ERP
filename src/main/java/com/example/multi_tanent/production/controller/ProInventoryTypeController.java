package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProInventoryTypeDto;
import com.example.multi_tanent.production.dto.ProInventoryTypeRequest;
import com.example.multi_tanent.production.services.ProInventoryTypeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/inventory-types")
@PreAuthorize("isAuthenticated()")
public class ProInventoryTypeController {

    private final ProInventoryTypeService inventoryTypeService;

    public ProInventoryTypeController(ProInventoryTypeService inventoryTypeService) {
        this.inventoryTypeService = inventoryTypeService;
    }

    @PostMapping
    public ResponseEntity<ProInventoryTypeDto> createInventoryType(@Valid @RequestBody ProInventoryTypeRequest request) {
        ProInventoryTypeDto created = inventoryTypeService.createInventoryType(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ProInventoryTypeDto> getAllInventoryTypes() {
        return inventoryTypeService.getAllInventoryTypes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProInventoryTypeDto> getInventoryTypeById(@PathVariable Long id) {
        ProInventoryTypeDto dto = inventoryTypeService.getInventoryTypeById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProInventoryTypeDto> updateInventoryType(@PathVariable Long id, @Valid @RequestBody ProInventoryTypeRequest request) {
        ProInventoryTypeDto updated = inventoryTypeService.updateInventoryType(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventoryType(@PathVariable Long id) {
        inventoryTypeService.deleteInventoryType(id);
        return ResponseEntity.noContent().build();
    }
}
