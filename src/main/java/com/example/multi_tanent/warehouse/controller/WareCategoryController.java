package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.WareCategoryRequest;
import com.example.multi_tanent.warehouse.dto.WareCategoryResponse;
import com.example.multi_tanent.warehouse.service.WareCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WareCategoryController {

    private final WareCategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<WareCategoryResponse>> list() {
        return ResponseEntity.ok(categoryService.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WareCategoryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @PostMapping
    public ResponseEntity<WareCategoryResponse> create(@Valid @RequestBody WareCategoryRequest req) {
        return ResponseEntity.ok(categoryService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WareCategoryResponse> update(@PathVariable Long id,
            @Valid @RequestBody WareCategoryRequest req) {
        return ResponseEntity.ok(categoryService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
