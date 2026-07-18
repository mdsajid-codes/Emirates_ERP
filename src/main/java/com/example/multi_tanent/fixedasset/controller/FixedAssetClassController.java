package com.example.multi_tanent.fixedasset.controller;

import com.example.multi_tanent.fixedasset.entity.FixedAssetClass;
import com.example.multi_tanent.fixedasset.service.FixedAssetClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fixed-assets/classes")
@RequiredArgsConstructor
public class FixedAssetClassController {

    private final FixedAssetClassService fixedAssetClassService;

    @GetMapping
    public ResponseEntity<List<FixedAssetClass>> getAllClasses() {
        return ResponseEntity.ok(fixedAssetClassService.getAllClasses());
    }
}
