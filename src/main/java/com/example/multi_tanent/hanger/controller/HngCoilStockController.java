package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.annotation.RequiresHangerModule;
import com.example.multi_tanent.hanger.dto.HngCoilStockResponse;
import com.example.multi_tanent.hanger.enums.CoilInspectionStatus;
import com.example.multi_tanent.hanger.service.HngCoilStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hanger/coil-stock")
@RequiredArgsConstructor
@RequiresHangerModule
public class HngCoilStockController {

    private final HngCoilStockService coilStockService;

    /** GET all coils for the current tenant */
    @GetMapping
    public ResponseEntity<List<HngCoilStockResponse>> getAll() {
        return ResponseEntity.ok(coilStockService.getAll());
    }

    /** GET only AVAILABLE + PARTIAL coils — production-ready stock */
    @GetMapping("/available")
    public ResponseEntity<List<HngCoilStockResponse>> getAvailable() {
        return ResponseEntity.ok(coilStockService.getAvailableStock());
    }

    /** GET total remaining wire weight in stock */
    @GetMapping("/total-remaining-weight")
    public ResponseEntity<Map<String, BigDecimal>> getTotalRemainingWeight() {
        return ResponseEntity.ok(Map.of("totalRemainingWeightKg", coilStockService.getTotalRemainingWeight()));
    }

    /** GET a single coil by ID */
    @GetMapping("/{id}")
    public ResponseEntity<HngCoilStockResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(coilStockService.getById(id));
    }

    /** GET coils filtered by inspection status (PENDING / APPROVED / REJECTED) */
    @GetMapping("/by-inspection-status/{status}")
    public ResponseEntity<List<HngCoilStockResponse>> getByInspectionStatus(
            @PathVariable CoilInspectionStatus status) {
        return ResponseEntity.ok(coilStockService.getByInspectionStatus(status));
    }

    /** GET all coils issued to a specific Manufacturing Order */
    @GetMapping("/by-mo/{moId}")
    public ResponseEntity<List<HngCoilStockResponse>> getByMo(@PathVariable Long moId) {
        return ResponseEntity.ok(coilStockService.getByMo(moId));
    }

    /**
     * GET eligible coils for material issue — matches gauge and available weight.
     * Used in Phase 3 Material Issue form to suggest which coils can be picked.
     */
    @GetMapping("/eligible-for-issue")
    public ResponseEntity<List<HngCoilStockResponse>> getEligibleForIssue(
            @RequestParam BigDecimal wireGaugeMm,
            @RequestParam(required = false, defaultValue = "0") BigDecimal minWeightRequired) {
        return ResponseEntity.ok(coilStockService.getEligibleForIssue(wireGaugeMm, minWeightRequired));
    }

    /**
     * PATCH update coil inspection status.
     * QC team uses this to APPROVE or REJECT a coil after physical inspection.
     */
    @PatchMapping("/{id}/inspection")
    public ResponseEntity<HngCoilStockResponse> updateInspectionStatus(
            @PathVariable Long id,
            @RequestParam CoilInspectionStatus status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(coilStockService.updateInspectionStatus(id, status, remarks));
    }
}
