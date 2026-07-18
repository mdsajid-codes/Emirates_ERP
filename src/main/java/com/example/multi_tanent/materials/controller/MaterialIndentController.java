package com.example.multi_tanent.materials.controller;

import com.example.multi_tanent.materials.dto.MaterialIndentRequest;
import com.example.multi_tanent.materials.dto.MaterialIndentResponse;
import com.example.multi_tanent.materials.service.MaterialIndentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/material-indents")
@RequiredArgsConstructor
public class MaterialIndentController {

    private final MaterialIndentService materialIndentService;

    @PostMapping("/create")
    public ResponseEntity<MaterialIndentResponse> create(@RequestBody MaterialIndentRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIndentService.create(request, httpRequest));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MaterialIndentResponse> update(@PathVariable Long id,
            @RequestBody MaterialIndentRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIndentService.update(id, request, httpRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialIndentResponse> getById(@PathVariable Long id, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIndentService.getById(id, httpRequest));
    }

    @GetMapping("/all")
    public ResponseEntity<Page<MaterialIndentResponse>> getAll(Pageable pageable, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIndentService.getAll(pageable, httpRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        materialIndentService.delete(id, httpRequest);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/status/{id}")
    public ResponseEntity<MaterialIndentResponse> updateStatus(@PathVariable Long id,
            @RequestBody MaterialIndentRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIndentService.updateStatus(id, request, httpRequest));
    }

    @PatchMapping("/approval-status/{id}")
    public ResponseEntity<MaterialIndentResponse> updateApproval(@PathVariable Long id,
            @RequestBody com.example.multi_tanent.materials.dto.IndentApprovalRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIndentService.updateApproval(id, request, httpRequest));
    }

    @PatchMapping("/po-status/{id}")
    public ResponseEntity<MaterialIndentResponse> updatePoStatus(@PathVariable Long id,
            @RequestBody com.example.multi_tanent.materials.dto.PoStatusRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIndentService.updatePoStatus(id, request, httpRequest));
    }
}
