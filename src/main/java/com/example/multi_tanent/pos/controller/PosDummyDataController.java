package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.service.PosDummyDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PosDummyDataController {

    private final PosDummyDataService dummyDataService;

    @PostMapping({"/seed-data", "/seed/dummy-data"})
    public ResponseEntity<Map<String, Object>> seedDummyData(@RequestParam(required = false) Long storeId) {
        Map<String, Object> result = dummyDataService.seedDummyData(storeId);
        return ResponseEntity.ok(result);
    }
}
