package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.annotation.RequiresHangerModule;
import com.example.multi_tanent.hanger.dto.HngBatchRequest;
import com.example.multi_tanent.hanger.dto.HngBatchResponse;
import com.example.multi_tanent.hanger.service.HngProductionBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.example.multi_tanent.hanger.dto.HngBatchTimelineResponse;
import com.example.multi_tanent.hanger.service.HngBatchReportPdfService;
import com.example.multi_tanent.hanger.service.HngBatchTimelineService;
import com.example.multi_tanent.hanger.entity.HngProductionBatch;
import com.example.multi_tanent.hanger.enums.BatchStage;

import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/hanger/batches")
@RequiredArgsConstructor
@RequiresHangerModule
public class HngProductionBatchController {

    private final HngProductionBatchService service;
    private final HngBatchReportPdfService reportPdfService;
    private final HngBatchTimelineService timelineService;

    @PostMapping
    public ResponseEntity<HngBatchResponse> create(@Valid @RequestBody HngBatchRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<Page<HngBatchResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HngBatchResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/by-mo/{moId}")
    public ResponseEntity<List<HngBatchResponse>> listByMo(@PathVariable Long moId) {
        return ResponseEntity.ok(service.listByMo(moId));
    }

    @PatchMapping("/{id}/advance-stage")
    public ResponseEntity<HngBatchResponse> advanceStage(@PathVariable Long id) {
        return ResponseEntity.ok(service.advanceStage(id));
    }

    @PatchMapping("/{id}/revert-stage")
    public ResponseEntity<HngBatchResponse> revertStage(@PathVariable Long id) {
        return ResponseEntity.ok(service.revertStage(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<HngBatchResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancel(id));
    }

    @GetMapping("/wip-summary")
    public ResponseEntity<Map<BatchStage, List<HngBatchResponse>>> getWipSummary() {
        return ResponseEntity.ok(service.getWipSummary());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<HngBatchResponse> updateProductionFields(@PathVariable Long id,
            @RequestBody HngBatchRequest req) {
        return ResponseEntity.ok(service.updateProductionFields(id, req));
    }

    @GetMapping("/{id}/report-pdf")
    public ResponseEntity<byte[]> getReportPdf(@PathVariable Long id) {
        HngProductionBatch batchEntity = service.getEntityById(id);
        byte[] pdfBytes = reportPdfService.generateBatchSummaryReport(batchEntity);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=BatchReport-" + batchEntity.getBatchNo() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<HngBatchTimelineResponse> getTimeline(
            @PathVariable Long id) {
        HngProductionBatch batchEntity = service.getEntityById(id);
        return ResponseEntity.ok(timelineService.getBatchTimeline(batchEntity));
    }
}
