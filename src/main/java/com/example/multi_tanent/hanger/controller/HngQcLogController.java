package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.dto.HngQcLogRequest;
import com.example.multi_tanent.hanger.dto.HngQcLogResponse;
import com.example.multi_tanent.hanger.service.HngQcLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hanger/qc-logs")
@RequiredArgsConstructor
public class HngQcLogController {

    private final HngQcLogService qcService;

    @PostMapping
    public ResponseEntity<HngQcLogResponse> createQcLog(@RequestBody HngQcLogRequest request) {
        return ResponseEntity.ok(qcService.createQcLog(request));
    }

    @GetMapping("/by-batch/{batchId}")
    public ResponseEntity<List<HngQcLogResponse>> getLogsByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(qcService.getLogsByBatch(batchId));
    }

    @PostMapping("/complete-batch/{batchId}")
    public ResponseEntity<String> completeBatch(@PathVariable Long batchId) {
        qcService.completeBatch(batchId);
        return ResponseEntity.ok("Batch marked as COMPLETED successfully");
    }
}
