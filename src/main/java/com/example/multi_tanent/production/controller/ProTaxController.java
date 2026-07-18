package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProTaxRequest;
import com.example.multi_tanent.production.dto.ProTaxResponse;
import com.example.multi_tanent.production.services.ProTaxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/taxes")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProTaxController {

    private final ProTaxService service;

    @PostMapping
    public ResponseEntity<ProTaxResponse> create(@Valid @RequestBody ProTaxRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProTaxResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProTaxResponse> update(@PathVariable Long id, @Valid @RequestBody ProTaxRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
