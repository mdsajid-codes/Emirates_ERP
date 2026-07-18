package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.dto.PurchaseOrderItemDto;
import com.example.multi_tanent.pos.dto.PurchaseOrderItemRequest;
import com.example.multi_tanent.pos.service.PurchaseOrderItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pos/purchase-orders/{purchaseOrderId}/items")
@CrossOrigin(origins = "*")
public class PurchaseOrderItemController {

    private final PurchaseOrderItemService purchaseOrderItemService;

    public PurchaseOrderItemController(PurchaseOrderItemService purchaseOrderItemService) {
        this.purchaseOrderItemService = purchaseOrderItemService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<PurchaseOrderItemDto> addItemToPurchaseOrder(@PathVariable Long purchaseOrderId, @Valid @RequestBody PurchaseOrderItemRequest itemRequest) {
        PurchaseOrderItemDto createdItem = purchaseOrderItemService.addItem(purchaseOrderId, itemRequest);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/pos/purchase-orders/{purchaseOrderId}/items/{itemId}").buildAndExpand(purchaseOrderId, createdItem.getId()).toUri();
        return ResponseEntity.created(location).body(createdItem);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<List<PurchaseOrderItemDto>> getItemsForPurchaseOrder(@PathVariable Long purchaseOrderId) {
        return ResponseEntity.ok(purchaseOrderItemService.getItemsForPurchaseOrder(purchaseOrderId));
    }

    @PutMapping("/{itemId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<PurchaseOrderItemDto> updateItem(@PathVariable Long purchaseOrderId, @PathVariable Long itemId, @Valid @RequestBody PurchaseOrderItemRequest itemRequest) {
        return ResponseEntity.ok(purchaseOrderItemService.updateItem(purchaseOrderId, itemId, itemRequest));
    }

    @DeleteMapping("/{itemId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long purchaseOrderId, @PathVariable Long itemId) {
        purchaseOrderItemService.deleteItem(purchaseOrderId, itemId);
        return ResponseEntity.noContent().build();
    }
}
