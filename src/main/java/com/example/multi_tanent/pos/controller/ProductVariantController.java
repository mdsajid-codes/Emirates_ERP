package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.dto.ProductVariantDto;
import com.example.multi_tanent.pos.dto.ProductVariantRequest;
import com.example.multi_tanent.pos.service.ProductVariantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pos/products/{productId}/variants")
@CrossOrigin(origins = "*")
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    public ProductVariantController(ProductVariantService productVariantService) {
        this.productVariantService = productVariantService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<ProductVariantDto> addVariantToProduct(@PathVariable Long productId, @Valid @RequestBody ProductVariantRequest variantRequest) {
        ProductVariantDto createdVariant = productVariantService.addVariant(productId, variantRequest);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/pos/products/{productId}/variants/{variantId}").buildAndExpand(productId, createdVariant.getId()).toUri();
        return ResponseEntity.created(location).body(createdVariant);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProductVariantDto>> getVariantsForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productVariantService.getVariantsForProduct(productId));
    }

    @GetMapping("/{variantId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProductVariantDto> getVariantById(@PathVariable Long productId, @PathVariable Long variantId) {
        return productVariantService.getVariantById(productId, variantId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{variantId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<ProductVariantDto> updateVariant(@PathVariable Long productId, @PathVariable Long variantId, @Valid @RequestBody ProductVariantRequest variantRequest) {
        return ResponseEntity.ok(productVariantService.updateVariant(productId, variantId, variantRequest));
    }

    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long productId, @PathVariable Long variantId) {
        productVariantService.deleteVariant(productId, variantId);
        return ResponseEntity.noContent().build();
    }
}
