package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.UoMRequest;
import com.example.multi_tanent.warehouse.dto.UoMResponse;
import com.example.multi_tanent.warehouse.service.UoMService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/uom")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UoMController {

    private final UoMService uomService;

    @GetMapping
    public ResponseEntity<List<UoMResponse>> list() {
        return ResponseEntity.ok(uomService.list());
    }

    @PostMapping
    public ResponseEntity<UoMResponse> create(@Valid @RequestBody UoMRequest req) {
        return ResponseEntity.ok(uomService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UoMResponse> update(@PathVariable Long id, @Valid @RequestBody UoMRequest req) {
        return ResponseEntity.ok(uomService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        uomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
