package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.ComplianceDocumentResponse;
import com.example.multi_tanent.fleet.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fleet/compliance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComplianceController {

    private final ComplianceService complianceService;

    @GetMapping("/expiring-documents")
    @Operation(summary = "Get all expiring/expired documents across vehicles and drivers")
    public ResponseEntity<List<ComplianceDocumentResponse>> getExpiringDocuments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer daysThreshold) {
        return ResponseEntity.ok(complianceService.getExpiringDocuments(status, daysThreshold));
    }
}
