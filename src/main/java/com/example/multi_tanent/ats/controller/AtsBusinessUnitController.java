package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsBusinessUnitRequest;
import com.example.multi_tanent.ats.dto.AtsBusinessUnitResponse;
import com.example.multi_tanent.ats.services.AtsBusinessUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/business-units")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsBusinessUnitController {

    private final AtsBusinessUnitService businessUnitService;

    @PostMapping
    public ResponseEntity<AtsBusinessUnitResponse> create(@Valid @RequestBody AtsBusinessUnitRequest request) {
        return new ResponseEntity<>(businessUnitService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsBusinessUnitResponse>> getAll() {
        return ResponseEntity.ok(businessUnitService.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<AtsBusinessUnitResponse>> getAllActive() {
        return ResponseEntity.ok(businessUnitService.getAllActive());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<AtsBusinessUnitResponse>> getPage(Pageable pageable) {
        return ResponseEntity.ok(businessUnitService.getPage(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsBusinessUnitResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(businessUnitService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsBusinessUnitResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AtsBusinessUnitRequest request) {
        return ResponseEntity.ok(businessUnitService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        businessUnitService.delete(id);
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<AtsBusinessUnitResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(businessUnitService.toggleActive(id));
    }
}
