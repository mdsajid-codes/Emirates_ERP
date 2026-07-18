package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.dto.TaxRateRequest;
import com.example.multi_tanent.pos.entity.TaxRate;
import com.example.multi_tanent.pos.service.TaxRateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pos/tax-rates")
@CrossOrigin(origins = "*")
public class TaxRateController {
    private final TaxRateService taxRateService;

    public TaxRateController(TaxRateService taxRateService) {
        this.taxRateService = taxRateService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<TaxRate> createTaxRate(@Valid @RequestBody TaxRateRequest taxRateRequest) {
        TaxRate createdTaxRate = taxRateService.createTaxRate(taxRateRequest);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdTaxRate.getId())
                .toUri();
        return ResponseEntity.created(location).body(createdTaxRate);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaxRate>> getAllTaxRates() {
        return ResponseEntity.ok(taxRateService.getAllTaxRatesForCurrentTenant());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaxRate> getTaxRateById(@PathVariable Long id) {
        return taxRateService.getTaxRateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<TaxRate> updateTaxRate(@PathVariable Long id, @Valid @RequestBody TaxRateRequest taxRateRequest) {
        return ResponseEntity.ok(taxRateService.updateTaxRate(id, taxRateRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Void> deleteTaxRate(@PathVariable Long id) {
        taxRateService.deleteTaxRate(id);
        return ResponseEntity.noContent().build();
    }
}
