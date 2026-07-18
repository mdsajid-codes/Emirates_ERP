package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProSubCategoryRequest;
import com.example.multi_tanent.production.dto.ProSubCategoryResponse;
import com.example.multi_tanent.production.services.ProSubCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/sub-categories")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProSubCategoryController {

    private final ProSubCategoryService service;

    @PostMapping
    public ResponseEntity<ProSubCategoryResponse> create(@Valid @RequestBody ProSubCategoryRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProSubCategoryResponse>> getAllByCategoryId(@RequestParam Long categoryId) {
        return ResponseEntity.ok(service.getAllByCategoryId(categoryId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProSubCategoryResponse> update(@PathVariable Long id, @Valid @RequestBody ProSubCategoryRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}