package com.example.multi_tanent.fixedasset.controller;

import com.example.multi_tanent.fixedasset.dto.FixedAssetRequest;
import com.example.multi_tanent.fixedasset.dto.FixedAssetResponse;
import com.example.multi_tanent.fixedasset.service.FixedAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fixed-assets")
@RequiredArgsConstructor
public class FixedAssetController {

    private final FixedAssetService fixedAssetService;

    @GetMapping
    public ResponseEntity<List<FixedAssetResponse>> getAllAssets() {
        return ResponseEntity.ok(fixedAssetService.getAllAssets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FixedAssetResponse> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(fixedAssetService.getAssetById(id));
    }

    @PostMapping
    public ResponseEntity<FixedAssetResponse> createAsset(@RequestBody FixedAssetRequest request) {
        return ResponseEntity.ok(fixedAssetService.createAsset(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FixedAssetResponse> updateAsset(@PathVariable Long id, @RequestBody FixedAssetRequest request) {
        return ResponseEntity.ok(fixedAssetService.updateAsset(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        fixedAssetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}
