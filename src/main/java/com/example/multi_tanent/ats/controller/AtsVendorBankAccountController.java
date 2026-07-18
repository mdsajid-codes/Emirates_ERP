package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorBankAccountRequest;
import com.example.multi_tanent.ats.dto.AtsVendorBankAccountResponse;
import com.example.multi_tanent.ats.services.AtsVendorBankAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ats/vendors/{vendorId}/bank-accounts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorBankAccountController {

    private final AtsVendorBankAccountService bankAccountService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable Long vendorId,
            @RequestParam("file") MultipartFile file) {
        String filePath = bankAccountService.uploadFile(vendorId, file);
        return ResponseEntity.ok(Map.of("filePath", filePath));
    }

    @PostMapping
    public ResponseEntity<AtsVendorBankAccountResponse> create(
            @PathVariable Long vendorId,
            @Valid @RequestBody AtsVendorBankAccountRequest request) {
        return new ResponseEntity<>(bankAccountService.create(vendorId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsVendorBankAccountResponse>> list(@PathVariable Long vendorId) {
        return ResponseEntity.ok(bankAccountService.getAllForVendor(vendorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsVendorBankAccountResponse> get(
            @PathVariable Long vendorId,
            @PathVariable Long id) {
        return ResponseEntity.ok(bankAccountService.getById(vendorId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsVendorBankAccountResponse> update(
            @PathVariable Long vendorId,
            @PathVariable Long id,
            @Valid @RequestBody AtsVendorBankAccountRequest request) {
        return ResponseEntity.ok(bankAccountService.update(vendorId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long vendorId, @PathVariable Long id) {
        bankAccountService.delete(vendorId, id);
    }
}
