package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.annotation.RequiresHangerModule;
import com.example.multi_tanent.hanger.dto.*;
import com.example.multi_tanent.hanger.service.HngCostRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hanger/cost-rates")
@RequiredArgsConstructor
@RequiresHangerModule
@CrossOrigin(origins = "*")
public class HngCostRateController {

    private final HngCostRateService service;

    @PostMapping
    public ResponseEntity<HngCostRateResponse> create(@Valid @RequestBody HngCostRateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<HngCostRateResponse>> list() {
        return ResponseEntity.ok(service.list());
    }

    @PutMapping("/{id}")
    public ResponseEntity<HngCostRateResponse> update(@PathVariable Long id,
            @Valid @RequestBody HngCostRateRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<HngCostSheetResponse> getCostSheet(@PathVariable Long batchId) {
        return ResponseEntity.ok(service.getCostSheet(batchId));
    }
}
