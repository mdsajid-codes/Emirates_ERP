package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.annotation.RequiresHangerModule;
import com.example.multi_tanent.hanger.dto.HngWireProcessingRequest;
import com.example.multi_tanent.hanger.dto.HngWireProcessingResponse;
import com.example.multi_tanent.hanger.service.HngWireProcessingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hanger/wire-processing")
@RequiredArgsConstructor
@RequiresHangerModule
public class HngWireProcessingController {

    private final HngWireProcessingService wireProcessingService;

    @PostMapping
    public ResponseEntity<HngWireProcessingResponse> create(@Valid @RequestBody HngWireProcessingRequest req) {
        return ResponseEntity.ok(wireProcessingService.create(req));
    }

    @GetMapping("/by-batch/{batchId}")
    public ResponseEntity<List<HngWireProcessingResponse>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(wireProcessingService.getByBatch(batchId));
    }
}
