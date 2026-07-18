package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProSemiFinishedRequest;
import com.example.multi_tanent.production.dto.ProSemiFinishedResponse;
import com.example.multi_tanent.production.services.ProSemiFinishedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/production/semi-finished")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProSemiFinishedController {

    private final ProSemiFinishedService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProSemiFinishedResponse> create(@Valid @ModelAttribute ProSemiFinishedRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ProSemiFinishedResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProSemiFinishedResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/by-item-code/{itemCode}")
    public ResponseEntity<ProSemiFinishedResponse> getByItemCode(@PathVariable String itemCode) {
        return ResponseEntity.ok(service.getByItemCode(itemCode));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProSemiFinishedResponse> update(@PathVariable Long id,
            @Valid @ModelAttribute ProSemiFinishedRequest request) {
        return ResponseEntity.ok(service.update(id, request));
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
                return ResponseEntity.ok("Semi-finished goods imported successfully.");
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

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAll() throws java.io.IOException {
        return service.exportAll();
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<org.springframework.core.io.Resource> getSemiFinishedImage(@PathVariable Long id) {
        org.springframework.core.io.Resource resource = service.getSemiFinishedImage(id);

        String contentType = "application/octet-stream";
        try {
            contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
        } catch (Exception ex) {
            // fallback
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/barcode-image")
    public ResponseEntity<org.springframework.core.io.Resource> getSemiFinishedBarcodeImage(@PathVariable Long id) {
        org.springframework.core.io.Resource resource = service.getSemiFinishedBarcodeImage(id);

        String contentType = "image/png"; // Barcodes are usually PNGs from our service
        try {
            contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
        } catch (Exception ex) {
            // fallback
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
