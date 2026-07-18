package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurAdditionalExpenseProduct;
import com.example.multi_tanent.purchases.entity.PurGrn;
import com.example.multi_tanent.purchases.entity.PurPurchaseInvoice;
import com.example.multi_tanent.purchases.dto.PurAdditionalExpenseRequest;
import com.example.multi_tanent.purchases.dto.PurAdditionalExpenseResponse;
import com.example.multi_tanent.purchases.service.PurAdditionalExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases/additional-expenses")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PurAdditionalExpenseController {

    private final PurAdditionalExpenseService service;

    @PostMapping
    public ResponseEntity<PurAdditionalExpenseResponse> create(@RequestBody PurAdditionalExpenseRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<PurAdditionalExpenseResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurAdditionalExpenseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurAdditionalExpenseResponse> update(@PathVariable Long id,
            @RequestBody PurAdditionalExpenseRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/service-products")
    public ResponseEntity<List<PurAdditionalExpenseProduct>> getServiceProducts() {
        return ResponseEntity.ok(service.getServiceRelatedProducts());
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<PurPurchaseInvoice>> getInvoices() {
        return ResponseEntity.ok(service.getPurchaseInvoices());
    }

    @GetMapping("/grns")
    public ResponseEntity<List<PurGrn>> getGrns() {
        return ResponseEntity.ok(service.getGrns());
    }
}
