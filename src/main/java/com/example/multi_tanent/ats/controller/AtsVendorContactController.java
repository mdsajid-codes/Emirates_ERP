package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorContactRequest;
import com.example.multi_tanent.ats.dto.AtsVendorContactResponse;
import com.example.multi_tanent.ats.services.AtsVendorContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/vendors/{vendorId}/contacts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorContactController {

    private final AtsVendorContactService contactService;

    @PostMapping
    public ResponseEntity<AtsVendorContactResponse> create(
            @PathVariable Long vendorId,
            @Valid @RequestBody AtsVendorContactRequest request) {
        return new ResponseEntity<>(contactService.create(vendorId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsVendorContactResponse>> getAll(@PathVariable Long vendorId) {
        return ResponseEntity.ok(contactService.getAll(vendorId));
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<AtsVendorContactResponse> getById(
            @PathVariable Long vendorId,
            @PathVariable Long contactId) {
        return ResponseEntity.ok(contactService.getById(vendorId, contactId));
    }

    @PutMapping("/{contactId}")
    public ResponseEntity<AtsVendorContactResponse> update(
            @PathVariable Long vendorId,
            @PathVariable Long contactId,
            @Valid @RequestBody AtsVendorContactRequest request) {
        return ResponseEntity.ok(contactService.update(vendorId, contactId, request));
    }

    @DeleteMapping("/{contactId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long vendorId,
            @PathVariable Long contactId) {
        contactService.delete(vendorId, contactId);
    }

    @PatchMapping("/{contactId}/set-primary")
    public ResponseEntity<AtsVendorContactResponse> setPrimary(
            @PathVariable Long vendorId,
            @PathVariable Long contactId) {
        return ResponseEntity.ok(contactService.setPrimary(vendorId, contactId));
    }
}
