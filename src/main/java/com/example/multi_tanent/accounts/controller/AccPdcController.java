package com.example.multi_tanent.accounts.controller;

import com.example.multi_tanent.accounts.dto.payment.AccPdcBounceRequest;
import com.example.multi_tanent.accounts.dto.payment.AccPdcClearRequest;
import com.example.multi_tanent.accounts.dto.payment.AccPdcResponse;
import com.example.multi_tanent.accounts.service.AccPdcService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts/pdcs")
@RequiredArgsConstructor
public class AccPdcController {

    private final AccPdcService pdcService;

    @PostMapping("/{id}/clear")
    public ResponseEntity<AccPdcResponse> clearPdc(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long id,
            @RequestBody AccPdcClearRequest request) {
        return ResponseEntity.ok(pdcService.clearPdc(id, request, tenantId));
    }

    @PostMapping("/{id}/bounce")
    public ResponseEntity<AccPdcResponse> bouncePdc(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long id,
            @RequestBody AccPdcBounceRequest request) {
        return ResponseEntity.ok(pdcService.bouncePdc(id, request, tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccPdcResponse> getPdc(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(pdcService.getPdc(id, tenantId));
    }

    @GetMapping
    public ResponseEntity<List<AccPdcResponse>> getAllPdcs(
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(pdcService.getAllPdcs(tenantId));
    }
}
