package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.dto.HngReworkEntryRequest;
import com.example.multi_tanent.hanger.dto.HngReworkEntryResponse;
import com.example.multi_tanent.hanger.service.HngReworkEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hanger/rework-entries")
@RequiredArgsConstructor
@CrossOrigin
public class HngReworkEntryController {

    private final HngReworkEntryService reworkService;

    @PostMapping
    public ResponseEntity<HngReworkEntryResponse> create(@RequestBody @Valid HngReworkEntryRequest request) {
        return ResponseEntity.ok(reworkService.createReworkEntry(request));
    }

    @GetMapping("/by-batch/{batchId}")
    public ResponseEntity<List<HngReworkEntryResponse>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(reworkService.getByBatch(batchId));
    }
}
