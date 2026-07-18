package com.example.multi_tanent.materials.controller;

import com.example.multi_tanent.materials.dto.MaterialReservationRequest;
import com.example.multi_tanent.materials.dto.MaterialReservationResponse;
import com.example.multi_tanent.materials.service.MaterialReservationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/material-reservations")
@RequiredArgsConstructor
public class MaterialReservationController {

    private final MaterialReservationService materialReservationService;

    @PostMapping("/create")
    public ResponseEntity<MaterialReservationResponse> create(@RequestBody MaterialReservationRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialReservationService.create(request, httpRequest));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MaterialReservationResponse> update(@PathVariable Long id,
            @RequestBody MaterialReservationRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialReservationService.update(id, request, httpRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialReservationResponse> getById(@PathVariable Long id, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialReservationService.getById(id, httpRequest));
    }

    @GetMapping("/all")
    public ResponseEntity<Page<MaterialReservationResponse>> getAll(Pageable pageable, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(materialReservationService.getAll(pageable, httpRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        materialReservationService.delete(id, httpRequest);
        return ResponseEntity.ok().build();
    }
}
