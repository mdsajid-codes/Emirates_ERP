package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProPriceCategoryDto;
import com.example.multi_tanent.production.dto.ProPriceCategoryRequest;
import com.example.multi_tanent.production.services.ProPriceCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/price-categories")
@PreAuthorize("isAuthenticated()")
public class ProPriceCategoryController {

    private final ProPriceCategoryService priceCategoryService;

    public ProPriceCategoryController(ProPriceCategoryService priceCategoryService) {
        this.priceCategoryService = priceCategoryService;
    }

    @PostMapping
    public ResponseEntity<ProPriceCategoryDto> createPriceCategory(@Valid @RequestBody ProPriceCategoryRequest request) {
        ProPriceCategoryDto created = priceCategoryService.createPriceCategory(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ProPriceCategoryDto> getAllPriceCategories() {
        return priceCategoryService.getAllPriceCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProPriceCategoryDto> getPriceCategoryById(@PathVariable Long id) {
        ProPriceCategoryDto dto = priceCategoryService.getPriceCategoryById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProPriceCategoryDto> updatePriceCategory(@PathVariable Long id, @Valid @RequestBody ProPriceCategoryRequest request) {
        ProPriceCategoryDto updated = priceCategoryService.updatePriceCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePriceCategory(@PathVariable Long id) {
        priceCategoryService.deletePriceCategory(id);
        return ResponseEntity.noContent().build();
    }
}
