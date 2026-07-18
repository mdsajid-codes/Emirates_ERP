package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.WareProductBatchRequest;
import com.example.multi_tanent.warehouse.dto.WareProductBatchResponse;
import com.example.multi_tanent.warehouse.service.WareProductBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/batches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WareProductBatchController {

    private final WareProductBatchService batchService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<WareProductBatchResponse>> listByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(batchService.listByProduct(productId));
    }

    @PostMapping
    public ResponseEntity<WareProductBatchResponse> create(@Valid @RequestBody WareProductBatchRequest req) {
        return ResponseEntity.ok(batchService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WareProductBatchResponse> update(@PathVariable Long id,
            @Valid @RequestBody WareProductBatchRequest req) {
        return ResponseEntity.ok(batchService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        batchService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
