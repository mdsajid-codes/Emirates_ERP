package com.example.multi_tanent.master.controller;

import com.example.multi_tanent.master.dto.TenantCompanyInfoRequest;
import com.example.multi_tanent.master.dto.TenantCompanyInfoResponse;
import com.example.multi_tanent.master.service.TenantCompanyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;

@RestController
@RequestMapping("/api/master/tenant-company-info")
@RequiredArgsConstructor
public class TenantCompanyInfoController {

    private final TenantCompanyInfoService service;

    @PostMapping(value = "/{masterTenantId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantCompanyInfoResponse> saveOrUpdate(
            @PathVariable Long masterTenantId,
            @ModelAttribute TenantCompanyInfoRequest request) throws IOException {
        return ResponseEntity.ok(service.saveOrUpdate(masterTenantId, request));
    }

    @GetMapping("/{masterTenantId}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantCompanyInfoResponse> getByMasterTenantId(@PathVariable Long masterTenantId) {
        return ResponseEntity.ok(service.getByMasterTenantId(masterTenantId));
    }

    @PutMapping(value = "/{masterTenantId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantCompanyInfoResponse> update(
            @PathVariable Long masterTenantId,
            @ModelAttribute TenantCompanyInfoRequest request) throws IOException {
        return ResponseEntity.ok(service.saveOrUpdate(masterTenantId, request));
    }

    @DeleteMapping("/{masterTenantId}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long masterTenantId) {
        service.deleteByMasterTenantId(masterTenantId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/images/{fileName:.+}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request)
            throws IOException {
        Resource resource = service.loadFileAsResource(fileName);
        String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
