package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.services.CrmDummyDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/crm/seed")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmDummyDataController {

    private final CrmDummyDataService dummyDataService;

    @PostMapping({"/dummy-data", "/insert-dummy-data"})
    public ResponseEntity<Map<String, Object>> seedDummyData() {
        Map<String, Object> result = dummyDataService.seedDummyData();
        return ResponseEntity.ok(result);
    }
}
