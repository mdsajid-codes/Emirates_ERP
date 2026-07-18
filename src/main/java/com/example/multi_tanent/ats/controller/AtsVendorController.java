package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.*;
import com.example.multi_tanent.ats.enums.VendorStatus;
import com.example.multi_tanent.ats.services.AtsVendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/vendors")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorController {

    private final AtsVendorService vendorService;

    @PostMapping
    public ResponseEntity<AtsVendorDetailResponse> create(@Valid @RequestBody AtsVendorRequest request) {
        return new ResponseEntity<>(vendorService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<AtsVendorSummaryResponse>> getPage(@ModelAttribute AtsVendorFilterRequest filter) {
        return ResponseEntity.ok(vendorService.getPage(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsVendorDetailResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsVendorDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AtsVendorRequest request) {
        return ResponseEntity.ok(vendorService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        vendorService.delete(id);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AtsVendorSummaryResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam VendorStatus status) {
        return ResponseEntity.ok(vendorService.changeStatus(id, status));
    }

    @PatchMapping("/{id}/blacklist")
    public ResponseEntity<AtsVendorSummaryResponse> blacklist(
            @PathVariable Long id,
            @RequestParam String reason) {
        return ResponseEntity.ok(vendorService.blacklist(id, reason));
    }

    @PatchMapping("/{id}/unblacklist")
    public ResponseEntity<AtsVendorSummaryResponse> unblacklist(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.unblacklist(id));
    }
}
