package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.WareTaxRequest;
import com.example.multi_tanent.warehouse.dto.WareTaxResponse;
import com.example.multi_tanent.warehouse.service.WareTaxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/taxes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WareTaxController {

    private final WareTaxService taxService;

    @GetMapping
    public ResponseEntity<List<WareTaxResponse>> list() {
        return ResponseEntity.ok(taxService.list());
    }

    @PostMapping
    public ResponseEntity<WareTaxResponse> create(@Valid @RequestBody WareTaxRequest req) {
        return ResponseEntity.ok(taxService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WareTaxResponse> update(@PathVariable Long id, @Valid @RequestBody WareTaxRequest req) {
        return ResponseEntity.ok(taxService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taxService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
