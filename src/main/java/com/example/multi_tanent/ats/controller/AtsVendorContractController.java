package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorContractRequest;
import com.example.multi_tanent.ats.dto.AtsVendorContractResponse;
import com.example.multi_tanent.ats.services.AtsVendorContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/vendors/{vendorId}/contracts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorContractController {

    private final AtsVendorContractService contractService;

    @PostMapping
    public ResponseEntity<AtsVendorContractResponse> create(
            @PathVariable Long vendorId,
            @Valid @RequestBody AtsVendorContractRequest request) {
        return new ResponseEntity<>(contractService.create(vendorId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsVendorContractResponse>> getAll(@PathVariable Long vendorId) {
        return ResponseEntity.ok(contractService.getAll(vendorId));
    }

    @GetMapping("/{contractId}")
    public ResponseEntity<AtsVendorContractResponse> getById(
            @PathVariable Long vendorId,
            @PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.getById(vendorId, contractId));
    }

    @PutMapping("/{contractId}")
    public ResponseEntity<AtsVendorContractResponse> update(
            @PathVariable Long vendorId,
            @PathVariable Long contractId,
            @Valid @RequestBody AtsVendorContractRequest request) {
        return ResponseEntity.ok(contractService.update(vendorId, contractId, request));
    }

    @DeleteMapping("/{contractId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long vendorId,
            @PathVariable Long contractId) {
        contractService.delete(vendorId, contractId);
    }
}
