package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.DriverRequest;
import com.example.multi_tanent.fleet.dtos.DriverResponse;
import com.example.multi_tanent.fleet.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/fleet/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody DriverRequest request) {
        return new ResponseEntity<>(driverService.createDriver(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverResponse> updateDriver(@PathVariable Long id, @Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> getDriver(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriver(id));
    }

    @GetMapping
    public ResponseEntity<Page<DriverResponse>> listDrivers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(driverService.listDrivers(status, search, pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<DriverResponse>> listAllDrivers() {
        return ResponseEntity.ok(driverService.listAllDrivers());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/profile-image")
    public ResponseEntity<DriverResponse> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(driverService.uploadProfileImage(id, file));
    }

    @GetMapping("/{id}/profile-image")
    public ResponseEntity<Resource> getProfileImage(@PathVariable Long id) {
        Resource resource = driverService.getProfileImage(id);
        String contentType = "image/jpeg"; // Default fallback
        try {
            contentType = java.nio.file.Files.probeContentType(java.nio.file.Paths.get(resource.getURI()));
        } catch (Exception e) {
            // fallback
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<com.example.multi_tanent.fleet.dtos.DriverDocumentResponse> uploadDocument(
            @PathVariable Long id,
            @RequestParam com.example.multi_tanent.fleet.enums.DriverDocumentType type,
            @RequestParam(required = false) String documentNumber,
            @RequestParam(required = false) java.time.LocalDate expiryDate,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(driverService.uploadDocument(id, type, documentNumber, expiryDate, file));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<java.util.List<com.example.multi_tanent.fleet.dtos.DriverDocumentResponse>> listDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDocuments(id));
    }
}
