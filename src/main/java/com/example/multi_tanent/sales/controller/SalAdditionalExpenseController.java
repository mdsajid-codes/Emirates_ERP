package com.example.multi_tanent.sales.controller;

import com.example.multi_tanent.sales.dto.SalAdditionalExpenseProduct;
import com.example.multi_tanent.sales.dto.SalAdditionalExpenseRequest;
import com.example.multi_tanent.sales.dto.SalAdditionalExpenseResponse;
import com.example.multi_tanent.sales.service.SalAdditionalExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales/additional-expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class SalAdditionalExpenseController {

    private final SalAdditionalExpenseService service;

    @PostMapping
    public ResponseEntity<SalAdditionalExpenseResponse> create(@RequestBody SalAdditionalExpenseRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<SalAdditionalExpenseResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalAdditionalExpenseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalAdditionalExpenseResponse> update(@PathVariable Long id, @RequestBody SalAdditionalExpenseRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/service-products")
    public ResponseEntity<List<SalAdditionalExpenseProduct>> getServiceRelatedProducts() {
        return ResponseEntity.ok(service.getServiceRelatedProducts());
    }
}
