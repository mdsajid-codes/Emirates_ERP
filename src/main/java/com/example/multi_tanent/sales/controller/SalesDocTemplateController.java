package com.example.multi_tanent.sales.controller;

import com.example.multi_tanent.sales.dto.SalesDocTemplateRequest;
import com.example.multi_tanent.sales.dto.SalesDocTemplateResponse;
import com.example.multi_tanent.sales.enums.SalesDocType;
import com.example.multi_tanent.sales.service.SalesDocTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales/templates")
@RequiredArgsConstructor
public class SalesDocTemplateController {

    private final SalesDocTemplateService templateService;

    @PostMapping
    public ResponseEntity<SalesDocTemplateResponse> createTemplate(@RequestBody SalesDocTemplateRequest request) {
        return ResponseEntity.ok(templateService.createTemplate(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesDocTemplateResponse> updateTemplate(@PathVariable Long id,
            @RequestBody SalesDocTemplateRequest request) {
        return ResponseEntity.ok(templateService.updateTemplate(id, request));
    }

    @GetMapping
    public ResponseEntity<List<SalesDocTemplateResponse>> getAllTemplates(
            @RequestParam(required = false) SalesDocType docType) {
        if (docType != null) {
            return ResponseEntity.ok(templateService.getTemplatesByType(docType));
        }
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesDocTemplateResponse> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<Void> setDefaultTemplate(@PathVariable Long id) {
        templateService.setDefaultTemplate(id);
        return ResponseEntity.ok().build();
    }
}
