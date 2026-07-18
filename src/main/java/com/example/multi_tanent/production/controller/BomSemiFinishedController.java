package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.BomSemiFinishedRequest;
import com.example.multi_tanent.production.dto.BomSemiFinishedResponse;
import com.example.multi_tanent.production.services.BomSemiFinishedService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/production/bom-semi-finished")
@RequiredArgsConstructor
public class BomSemiFinishedController {

    private final BomSemiFinishedService service;

    @PostMapping
    public ResponseEntity<BomSemiFinishedResponse> create(@RequestBody BomSemiFinishedRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BomSemiFinishedResponse> update(@PathVariable Long id,
            @RequestBody BomSemiFinishedRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BomSemiFinishedResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<BomSemiFinishedResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
