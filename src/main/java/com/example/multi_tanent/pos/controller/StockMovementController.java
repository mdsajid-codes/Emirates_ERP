package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.dto.*;
import com.example.multi_tanent.pos.service.StockMovementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pos/stock-movements")
@CrossOrigin(origins = "*")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<StockMovementDto> createStockMovement(@Valid @RequestBody StockMovementRequest request) {
        StockMovementDto createdMovement = stockMovementService.createStockMovement(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(createdMovement.getId()).toUri();
        return ResponseEntity.created(location).body(createdMovement);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StockMovementDto>> getAllStockMovements() {
        return ResponseEntity.ok(stockMovementService.getAllStockMovementsForCurrentTenant());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StockMovementDto> getStockMovementById(@PathVariable Long id) {
        return stockMovementService.getStockMovementDtoById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
