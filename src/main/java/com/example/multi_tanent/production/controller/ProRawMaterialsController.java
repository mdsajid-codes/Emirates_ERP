package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProRawMaterialsRequest;
import com.example.multi_tanent.production.dto.ProRawMaterialsResponse;
import com.example.multi_tanent.production.services.ProRawMaterialsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/production/raw-materials")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProRawMaterialsController {

    private final ProRawMaterialsService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProRawMaterialsResponse> create(
            @Valid @ModelAttribute ProRawMaterialsRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return new ResponseEntity<>(service.create(request, image), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ProRawMaterialsResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProRawMaterialsResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/by-item-code/{itemCode}")
    public ResponseEntity<ProRawMaterialsResponse> getByItemCode(@PathVariable String itemCode) {
        return ResponseEntity.ok(service.getByItemCode(itemCode));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProRawMaterialsResponse> update(
            @PathVariable Long id,
            @Valid @ModelAttribute ProRawMaterialsRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(service.update(id, request, image));
    }

    @PutMapping("/{id}/stock-quantity")
    public ResponseEntity<ProRawMaterialsResponse> updateStockQuantity(@PathVariable Long id,
            @RequestParam java.math.BigDecimal quantity) {
        return ResponseEntity.ok(service.updateStockQuantity(id, quantity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkCreate(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload an Excel file.");
        }
        try {
            List<String> errors = service.bulkCreate(file);
            if (errors.isEmpty()) {
                return ResponseEntity.ok("Raw materials imported successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process file: " + e.getMessage());
        }
    }

    @GetMapping("/bulk-template")
    public ResponseEntity<byte[]> downloadBulkTemplate() throws java.io.IOException {
        return service.generateBulkUploadTemplate();
    }

    @GetMapping("/view-file")
    public ResponseEntity<org.springframework.core.io.Resource> viewFile(@RequestParam String path) {
        org.springframework.core.io.Resource resource = service.loadFile(path);
        String contentType = "application/octet-stream";
        try {
            contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
        } catch (Exception ex) {
            // fallback
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<org.springframework.core.io.Resource> getRawMaterialImage(@PathVariable Long id) {
        org.springframework.core.io.Resource resource = service.getRawMaterialImage(id);
        String contentType = "application/octet-stream";
        try {
            contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
        } catch (Exception ex) {
            // fallback
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/barcode-image")
    public ResponseEntity<org.springframework.core.io.Resource> getRawMaterialBarcodeImage(@PathVariable Long id) {
        org.springframework.core.io.Resource resource = service.getRawMaterialBarcodeImage(id);
        String contentType = "image/png";
        try {
            contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
        } catch (Exception ex) {
            // fallback
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAll() throws java.io.IOException {
        return service.exportAll();
    }
}
