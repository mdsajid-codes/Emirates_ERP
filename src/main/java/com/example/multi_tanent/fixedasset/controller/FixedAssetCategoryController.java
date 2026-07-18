package com.example.multi_tanent.fixedasset.controller;

import com.example.multi_tanent.fixedasset.entity.FixedAssetCategory;
import com.example.multi_tanent.fixedasset.service.FixedAssetCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fixed-assets/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FixedAssetCategoryController {

    private final FixedAssetCategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<FixedAssetCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<FixedAssetCategory> createCategory(@RequestBody FixedAssetCategory category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FixedAssetCategory> updateCategory(@PathVariable Long id, @RequestBody FixedAssetCategory category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
