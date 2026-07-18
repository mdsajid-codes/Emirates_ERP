package com.example.multi_tanent.crm.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.multi_tanent.crm.dto.CrmProductDto;
import com.example.multi_tanent.crm.dto.CrmProductResponse;
import com.example.multi_tanent.crm.services.CrmProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/crm/products")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmProductController {

  private final CrmProductService productService;

  // Optional filter by industry: /api/settings/products?industryId=123
  @GetMapping
  @PreAuthorize("@crmAccess.canView('PRODUCT')")
  public ResponseEntity<List<CrmProductResponse>> list(@RequestParam(required = false) Long industryId) {
    return ResponseEntity.ok(productService.list(industryId));
  }

  @GetMapping("/{id}")
  @PreAuthorize("@crmAccess.canView('PRODUCT')")
  public ResponseEntity<CrmProductResponse> getById(@PathVariable Long id) {
    return ResponseEntity.ok(productService.getById(id));
  }

  @PostMapping
  @PreAuthorize("@crmAccess.canCreate('PRODUCT')")
  public ResponseEntity<CrmProductResponse> create(@Valid @RequestBody CrmProductDto req) {
    return ResponseEntity.ok(productService.create(req));
  }

  @PutMapping("/{id}")
  @PreAuthorize("@crmAccess.canUpdate('PRODUCT')")
  public ResponseEntity<CrmProductResponse> update(@PathVariable Long id,
                                        @Valid @RequestBody CrmProductDto req) {
    return ResponseEntity.ok(productService.update(id, req));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("@crmAccess.canDelete('PRODUCT')")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    productService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
