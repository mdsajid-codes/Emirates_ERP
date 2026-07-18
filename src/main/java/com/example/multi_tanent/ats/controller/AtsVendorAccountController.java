package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorAccountRequest;
import com.example.multi_tanent.ats.dto.AtsVendorAccountResponse;
import com.example.multi_tanent.ats.services.AtsVendorAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/vendors/{vendorId}/account")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorAccountController {

    private final AtsVendorAccountService accountService;

    @GetMapping
    public ResponseEntity<AtsVendorAccountResponse> get(@PathVariable Long vendorId) {
        return ResponseEntity.ok(accountService.get(vendorId));
    }

    @PutMapping
    public ResponseEntity<AtsVendorAccountResponse> upsert(
            @PathVariable Long vendorId,
            @Valid @RequestBody AtsVendorAccountRequest request) {
        return ResponseEntity.ok(accountService.upsert(vendorId, request));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long vendorId) {
        accountService.delete(vendorId);
    }
}
