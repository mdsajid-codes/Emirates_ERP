package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurSupplierTenderingRequest;
import com.example.multi_tanent.purchases.dto.PurSupplierTenderingResponse;
import com.example.multi_tanent.purchases.dto.PurTenderingComparisonDto;
import com.example.multi_tanent.purchases.service.PurSupplierTenderingService;
import com.example.multi_tanent.purchases.service.PurTenderingComparisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/purchases/supplier-tendering")
@RequiredArgsConstructor
public class PurSupplierTenderingController {

    private final PurSupplierTenderingService service;
    private final PurTenderingComparisonService comparisonService;

    @PostMapping
    public ResponseEntity<PurSupplierTenderingResponse> create(@RequestBody PurSupplierTenderingRequest request) {
        String tenderNumber = "TEND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return ResponseEntity.ok(service.create(request, tenderNumber));
    }

    @GetMapping
    public ResponseEntity<Page<PurSupplierTenderingResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurSupplierTenderingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurSupplierTenderingResponse> update(@PathVariable Long id, @RequestBody PurSupplierTenderingRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/comparison")
    public ResponseEntity<PurTenderingComparisonDto> compareResponses(@PathVariable Long id) {
        return ResponseEntity.ok(comparisonService.generateComparison(id));
    }
}
