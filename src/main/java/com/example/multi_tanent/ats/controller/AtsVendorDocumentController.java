package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorDocumentRequest;
import com.example.multi_tanent.ats.dto.AtsVendorDocumentResponse;
import com.example.multi_tanent.ats.services.AtsVendorDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ats/vendors/{vendorId}/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorDocumentController {

    private final AtsVendorDocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable Long vendorId,
            @RequestParam("file") MultipartFile file) {
        String filePath = documentService.uploadFile(vendorId, file);
        return ResponseEntity.ok(Map.of("filePath", filePath));
    }

    @PostMapping
    public ResponseEntity<AtsVendorDocumentResponse> create(
            @PathVariable Long vendorId,
            @Valid @RequestBody AtsVendorDocumentRequest request) {
        return new ResponseEntity<>(documentService.create(vendorId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsVendorDocumentResponse>> list(@PathVariable Long vendorId) {
        return ResponseEntity.ok(documentService.getAllForVendor(vendorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsVendorDocumentResponse> get(
            @PathVariable Long vendorId,
            @PathVariable Long id) {
        return ResponseEntity.ok(documentService.getById(vendorId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsVendorDocumentResponse> update(
            @PathVariable Long vendorId,
            @PathVariable Long id,
            @Valid @RequestBody AtsVendorDocumentRequest request) {
        return ResponseEntity.ok(documentService.update(vendorId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long vendorId, @PathVariable Long id) {
        documentService.delete(vendorId, id);
    }
}
