package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProToolCategoryDto;
import com.example.multi_tanent.production.dto.ProToolCategoryRequest;
import com.example.multi_tanent.production.services.ProToolCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/tool-categories")
@PreAuthorize("isAuthenticated()")
public class ProToolCategoryController {

    private final ProToolCategoryService toolCategoryService;

    public ProToolCategoryController(ProToolCategoryService toolCategoryService) {
        this.toolCategoryService = toolCategoryService;
    }

    @PostMapping
    public ResponseEntity<ProToolCategoryDto> createToolCategory(@Valid @RequestBody ProToolCategoryRequest request) {
        ProToolCategoryDto created = toolCategoryService.createToolCategory(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ProToolCategoryDto> getAllToolCategories() {
        return toolCategoryService.getAllToolCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProToolCategoryDto> getToolCategoryById(@PathVariable Long id) {
        ProToolCategoryDto dto = toolCategoryService.getToolCategoryById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProToolCategoryDto> updateToolCategory(@PathVariable Long id, @Valid @RequestBody ProToolCategoryRequest request) {
        ProToolCategoryDto updated = toolCategoryService.updateToolCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteToolCategory(@PathVariable Long id) {
        toolCategoryService.deleteToolCategory(id);
        return ResponseEntity.noContent().build();
    }
}
