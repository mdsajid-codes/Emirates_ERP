package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.WareSubCategoryRequest;
import com.example.multi_tanent.warehouse.dto.WareSubCategoryResponse;
import com.example.multi_tanent.warehouse.service.WareSubCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/subcategories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WareSubCategoryController {

    private final WareSubCategoryService subCategoryService;

    @GetMapping
    public ResponseEntity<List<WareSubCategoryResponse>> list(@RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(subCategoryService.list(categoryId));
    }

    @PostMapping
    public ResponseEntity<WareSubCategoryResponse> create(@Valid @RequestBody WareSubCategoryRequest req) {
        return ResponseEntity.ok(subCategoryService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WareSubCategoryResponse> update(@PathVariable Long id,
            @Valid @RequestBody WareSubCategoryRequest req) {
        return ResponseEntity.ok(subCategoryService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
