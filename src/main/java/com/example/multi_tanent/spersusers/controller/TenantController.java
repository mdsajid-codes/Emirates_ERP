package com.example.multi_tanent.spersusers.controller;

import com.example.multi_tanent.pos.dto.UpdateTenantRequest;
import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.dto.TenantDto;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/pos/tenant")
@CrossOrigin(origins = "*")
public class TenantController {
    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping("/current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TenantDto> getCurrentTenant() {
        return tenantService.getCurrentTenant()
                .map(tenant -> ResponseEntity.ok(tenantService.toDto(tenant)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/current")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<TenantDto> updateTenant(@RequestBody UpdateTenantRequest updateRequest) {
        Tenant updatedTenant = tenantService.updateCurrentTenant(updateRequest);
        return ResponseEntity.ok(tenantService.toDto(updatedTenant));
    }

    @PostMapping("/current/logo")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<TenantDto> uploadLogo(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file to upload.");
        }
        Tenant updatedTenant = tenantService.updateTenantLogo(file);
        return ResponseEntity.ok(tenantService.toDto(updatedTenant));
    }
}
