package com.example.multi_tanent.fixedasset.controller;

import com.example.multi_tanent.fixedasset.entity.FixedAssetGroup;
import com.example.multi_tanent.fixedasset.service.FixedAssetGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fixed-assets/groups")
@RequiredArgsConstructor
public class FixedAssetGroupController {

    private final FixedAssetGroupService fixedAssetGroupService;

    @GetMapping
    public ResponseEntity<List<FixedAssetGroup>> getAllGroups() {
        return ResponseEntity.ok(fixedAssetGroupService.getAllGroups());
    }
}
