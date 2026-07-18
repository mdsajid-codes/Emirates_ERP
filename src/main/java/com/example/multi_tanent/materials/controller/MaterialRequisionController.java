package com.example.multi_tanent.materials.controller;

import com.example.multi_tanent.materials.dto.MaterialRequisionResponse;
import com.example.multi_tanent.materials.enums.IndentStatus;
import com.example.multi_tanent.materials.enums.MaterialRequisitionStatus;
import com.example.multi_tanent.materials.enums.ReserveStatus;
import com.example.multi_tanent.materials.service.MaterialRequisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/materials/requisition")
@RequiredArgsConstructor
public class MaterialRequisionController {

    private final MaterialRequisionService service;

    @PostMapping("/generate-missing")
    public ResponseEntity<Void> generateMissing() {
        service.generateMissingRequisitions();
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Page<MaterialRequisionResponse>> getAll(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        return ResponseEntity.ok(service.getAll(pageable, search, fromDate, toDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialRequisionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MaterialRequisionResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam MaterialRequisitionStatus status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @PutMapping("/{id}/indent-status")
    public ResponseEntity<MaterialRequisionResponse> updateIndentStatus(
            @PathVariable Long id,
            @RequestParam IndentStatus status) {
        return ResponseEntity.ok(service.updateIndentStatus(id, status));
    }

    @PutMapping("/{id}/reserve-status")
    public ResponseEntity<MaterialRequisionResponse> updateReserveStatus(
            @PathVariable Long id,
            @RequestParam ReserveStatus status) {
        return ResponseEntity.ok(service.updateReserveStatus(id, status));
    }

    @GetMapping("/by-mo/{moId}")
    public ResponseEntity<MaterialRequisionResponse> getByManufacturingOrderId(@PathVariable Long moId) {
        return ResponseEntity.ok(service.getByManufacturingOrderId(moId));
    }

    @PatchMapping("/{id}/material-status")
    public ResponseEntity<MaterialRequisionResponse> updateMaterialStatus(
            @PathVariable Long id,
            @RequestParam com.example.multi_tanent.materials.enums.MaterialStatus status) {
        return ResponseEntity.ok(service.updateMaterialStatus(id, status));
    }
}
