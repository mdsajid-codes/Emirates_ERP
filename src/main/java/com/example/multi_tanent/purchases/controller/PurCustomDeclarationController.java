package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurCustomDeclarationRequest;
import com.example.multi_tanent.purchases.dto.PurCustomDeclarationResponse;
import com.example.multi_tanent.purchases.service.PurCustomDeclarationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/purchases/custom-declarations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class PurCustomDeclarationController {

    private final PurCustomDeclarationService service;

    @PostMapping
    public ResponseEntity<PurCustomDeclarationResponse> create(@RequestBody PurCustomDeclarationRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurCustomDeclarationResponse> update(@PathVariable Long id,
            @RequestBody PurCustomDeclarationRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurCustomDeclarationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<PurCustomDeclarationResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate-from-invoices")
    public ResponseEntity<PurCustomDeclarationResponse> generateFromInvoices(@RequestBody List<Long> invoiceIds) {
        return ResponseEntity.ok(service.generateFromInvoices(invoiceIds));
    }
}
