package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.ShelfRequest;
import com.example.multi_tanent.warehouse.dto.ShelfResponse;
import com.example.multi_tanent.warehouse.service.ShelfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/shelves")
@RequiredArgsConstructor
public class ShelfController {

    private final ShelfService shelfService;

    @GetMapping
    public ResponseEntity<List<ShelfResponse>> getAllShelves() {
        return ResponseEntity.ok(shelfService.getAllShelves());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShelfResponse> getShelfById(@PathVariable Long id) {
        return ResponseEntity.ok(shelfService.getShelfById(id));
    }

    @GetMapping("/status")
    public ResponseEntity<List<ShelfResponse>> getByActive(@RequestParam Boolean isActive) {
        return ResponseEntity.ok(shelfService.fetchByActive(isActive));
    }

    @GetMapping("/barcode/{barcodeTag}")
    public ResponseEntity<ShelfResponse> getByBarcodeTag(@PathVariable String barcodeTag) {
        return ResponseEntity.ok(shelfService.fetchByBarcodeTag(barcodeTag));
    }

    @PostMapping
    public ResponseEntity<ShelfResponse> createShelf(@RequestBody ShelfRequest request) {
        return new ResponseEntity<>(shelfService.createShelf(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShelfResponse> updateShelf(@PathVariable Long id, @RequestBody ShelfRequest request) {
        return ResponseEntity.ok(shelfService.updateShelf(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShelf(@PathVariable Long id) {
        shelfService.deleteShelf(id);
        return ResponseEntity.noContent().build();
    }
}
