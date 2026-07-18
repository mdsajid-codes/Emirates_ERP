package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.annotation.RequiresHangerModule;
import com.example.multi_tanent.hanger.dto.HngCoatingLogRequest;
import com.example.multi_tanent.hanger.dto.HngCoatingLogResponse;
import com.example.multi_tanent.hanger.service.HngCoatingLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hanger/coating-logs")
@RequiredArgsConstructor
@RequiresHangerModule
public class HngCoatingLogController {

    private final HngCoatingLogService coatingLogService;

    @PostMapping
    public ResponseEntity<HngCoatingLogResponse> create(@Valid @RequestBody HngCoatingLogRequest req) {
        return ResponseEntity.ok(coatingLogService.create(req));
    }

    @GetMapping("/by-batch/{batchId}")
    public ResponseEntity<List<HngCoatingLogResponse>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(coatingLogService.getByBatch(batchId));
    }

    @GetMapping("/summary/{batchId}")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable Long batchId) {
        List<HngCoatingLogResponse> logs = coatingLogService.getByBatch(batchId);

        int totalInput = logs.stream().mapToInt(HngCoatingLogResponse::getInputQty).sum();
        int totalProduced = logs.stream().mapToInt(HngCoatingLogResponse::getProducedQty).sum();
        int totalRejected = logs.stream().mapToInt(l -> l.getRejectedQty() != null ? l.getRejectedQty() : 0).sum();

        double avgRejectionPct = logs.stream()
                .filter(l -> l.getRejectionPct() != null)
                .mapToDouble(l -> l.getRejectionPct().doubleValue())
                .average()
                .orElse(0.0);

        return ResponseEntity.ok(Map.of(
                "totalInput", totalInput,
                "totalProduced", totalProduced,
                "totalRejected", totalRejected,
                "avgRejectionPct", avgRejectionPct,
                "count", logs.size()));
    }
}
