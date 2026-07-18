package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.dto.HngBatchPackingRequest;
import com.example.multi_tanent.hanger.dto.HngBatchPackingResponse;
import com.example.multi_tanent.hanger.dto.HngFgStockResponse;
import com.example.multi_tanent.hanger.dto.HngWarehouseStatsResponse;
import com.example.multi_tanent.hanger.entity.HngBatchPacking;
import com.example.multi_tanent.hanger.repository.HngBatchPackingRepository;
import com.example.multi_tanent.hanger.service.HngBatchPackingPdfService;
import com.example.multi_tanent.hanger.service.HngBatchPackingService;
import com.example.multi_tanent.config.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hanger/packing")
@RequiredArgsConstructor
public class HngBatchPackingController {

    private final HngBatchPackingService packingService;
    private final HngBatchPackingRepository packingRepo;
    private final HngBatchPackingPdfService pdfService;

    @PostMapping
    public ResponseEntity<HngBatchPackingResponse> create(@RequestBody HngBatchPackingRequest request) {
        return ResponseEntity.ok(packingService.createPackingRecord(request));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<HngBatchPackingResponse> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(packingService.confirmPacking(id));
    }

    @GetMapping("/by-batch/{batchId}")
    public ResponseEntity<List<HngBatchPackingResponse>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(packingService.getByBatch(batchId));
    }

    @GetMapping("/fg-stock")
    public ResponseEntity<List<HngFgStockResponse>> getFgStock() {
        return ResponseEntity.ok(packingService.getFgStockSummary());
    }

    @GetMapping("/warehouse-stats")
    public ResponseEntity<HngWarehouseStatsResponse> getWarehouseStats() {
        return ResponseEntity.ok(packingService.getWarehouseStats());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<HngBatchPackingResponse>> getRecent() {
        return ResponseEntity.ok(packingService.getRecentRecords(10));
    }

    @GetMapping("/{id}/packing-list")
    public ResponseEntity<byte[]> downloadPackingList(@PathVariable Long id) {
        HngBatchPacking packing = packingService.getPackingEntityById(id);

        byte[] pdfBytes = pdfService.generatePackingListPdf(packing);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=PackingList-" + packing.getPackingBatchNo() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
