package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.LoanProductRequest;
import com.example.multi_tanent.tenant.payroll.dto.LoanProductResponse;
import com.example.multi_tanent.tenant.payroll.entity.LoanProduct;
import com.example.multi_tanent.tenant.payroll.service.LoanProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/loan-products")
@CrossOrigin(origins = "*")

public class LoanProductController {

    private final LoanProductService loanProductService;

    public LoanProductController(LoanProductService loanProductService) {
        this.loanProductService = loanProductService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")

    public ResponseEntity<List<LoanProductResponse>> getAllLoanProducts() {
        List<LoanProductResponse> loanProducts = loanProductService.getAllLoanProducts().stream()
                .map(LoanProductResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(loanProducts);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")

    public ResponseEntity<LoanProductResponse> getLoanProductById(@PathVariable Long id) {
        return loanProductService.getLoanProductById(id)
                .map(loanProduct -> ResponseEntity.ok(LoanProductResponse.fromEntity(loanProduct)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<LoanProductResponse> createLoanProduct(@RequestBody LoanProductRequest request) {
        LoanProduct createdLoanProduct = loanProductService.createLoanProduct(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(createdLoanProduct.getId()).toUri();
        return ResponseEntity.created(location).body(LoanProductResponse.fromEntity(createdLoanProduct));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<LoanProductResponse> updateLoanProduct(@PathVariable Long id, @RequestBody LoanProductRequest request) {
        LoanProduct updatedLoanProduct = loanProductService.updateLoanProduct(id, request);
        return ResponseEntity.ok(LoanProductResponse.fromEntity(updatedLoanProduct));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteLoanProduct(@PathVariable Long id) {
        loanProductService.deleteLoanProduct(id);
        return ResponseEntity.noContent().build();
    }
}
