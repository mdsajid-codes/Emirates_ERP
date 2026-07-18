package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.dto.SaleItemRequest;
import com.example.multi_tanent.pos.entity.SaleItem;
import com.example.multi_tanent.pos.service.SaleItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos/sales/{saleId}/items")
@CrossOrigin(origins = "*")
public class SaleItemController {

    private final SaleItemService saleItemService;

    public SaleItemController(SaleItemService saleItemService) {
        this.saleItemService = saleItemService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SaleItem>> getAllItemsForSale(@PathVariable Long saleId) {
        return ResponseEntity.ok(saleItemService.getAllItemsForSale(saleId));
    }

    @GetMapping("/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SaleItem> getItemById(@PathVariable Long saleId, @PathVariable Long itemId) {
        return saleItemService.getItemById(saleId, itemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SaleItem> updateSaleItem(@PathVariable Long saleId, @PathVariable Long itemId, @Valid @RequestBody SaleItemRequest itemRequest) {
        return ResponseEntity.ok(saleItemService.updateSaleItem(saleId, itemId, itemRequest));
    }

    @DeleteMapping("/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeSaleItem(@PathVariable Long saleId, @PathVariable Long itemId) {
        saleItemService.removeSaleItem(saleId, itemId);
        return ResponseEntity.noContent().build();
    }
}
