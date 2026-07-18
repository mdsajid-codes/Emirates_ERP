package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProUnitRequest;
import com.example.multi_tanent.production.dto.ProUnitResponse;
import com.example.multi_tanent.production.services.ProUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/units")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProUnitController {

    private final ProUnitService service;

    @PostMapping
    public ResponseEntity<ProUnitResponse> create(@Valid @RequestBody ProUnitRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProUnitResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProUnitResponse> update(@PathVariable Long id, @Valid @RequestBody ProUnitRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
