package com.example.multi_tanent.materials.controller;

import com.example.multi_tanent.materials.dto.MaterialIssueRequest;
import com.example.multi_tanent.materials.dto.MaterialIssueResponse;
import com.example.multi_tanent.materials.service.MaterialIssueService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/material-issues")
@RequiredArgsConstructor
public class MaterialIssueController {

    private final MaterialIssueService materialIssueService;

    @PostMapping("/create")
    public ResponseEntity<MaterialIssueResponse> create(@RequestBody MaterialIssueRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIssueService.create(request, httpRequest));
    }

    @PutMapping(value = { "/update/{id}", "/{id}" })
    public ResponseEntity<MaterialIssueResponse> update(@PathVariable Long id,
            @RequestBody MaterialIssueRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIssueService.update(id, request, httpRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialIssueResponse> getById(@PathVariable Long id, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIssueService.getById(id, httpRequest));
    }

    @GetMapping("/all")
    public ResponseEntity<Page<MaterialIssueResponse>> getAll(Pageable pageable, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialIssueService.getAll(pageable, httpRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        materialIssueService.delete(id, httpRequest);
        return ResponseEntity.ok().build();
    }
}
