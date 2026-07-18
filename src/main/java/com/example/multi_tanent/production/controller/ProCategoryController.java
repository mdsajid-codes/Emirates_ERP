package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProCategoryRequest;
import com.example.multi_tanent.production.dto.ProCategoryResponse;
import com.example.multi_tanent.production.services.ProCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/categories")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProCategoryController {

    private final ProCategoryService service;

    @PostMapping
    public ResponseEntity<ProCategoryResponse> create(@Valid @RequestBody ProCategoryRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProCategoryResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProCategoryResponse> update(@PathVariable Long id, @Valid @RequestBody ProCategoryRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
