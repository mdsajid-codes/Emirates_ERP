package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProParameterRequest;
import com.example.multi_tanent.production.dto.ProParameterResponse;
import com.example.multi_tanent.production.services.ProParameterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/parameters")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProParameterController {

    private final ProParameterService service;

    @PostMapping
    public ResponseEntity<ProParameterResponse> create(@Valid @RequestBody ProParameterRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProParameterResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProParameterResponse> update(@PathVariable Long id, @Valid @RequestBody ProParameterRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
