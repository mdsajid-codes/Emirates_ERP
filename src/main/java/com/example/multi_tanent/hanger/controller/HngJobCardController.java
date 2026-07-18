package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.annotation.RequiresHangerModule;
import com.example.multi_tanent.hanger.dto.HngJobCardRequest;
import com.example.multi_tanent.hanger.dto.HngJobCardResponse;
import com.example.multi_tanent.hanger.dto.HngOeeResponse;
import com.example.multi_tanent.hanger.service.HngJobCardPdfService;
import com.example.multi_tanent.hanger.service.HngJobCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hanger/job-cards")
@RequiredArgsConstructor
@RequiresHangerModule
public class HngJobCardController {

    private final HngJobCardService jobCardService;
    private final HngJobCardPdfService pdfService;

    @PostMapping
    public ResponseEntity<HngJobCardResponse> create(@Valid @RequestBody HngJobCardRequest req) {
        return ResponseEntity.ok(jobCardService.create(req));
    }

    @GetMapping("/by-batch/{batchId}")
    public ResponseEntity<List<HngJobCardResponse>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(jobCardService.getByBatch(batchId));
    }

    @GetMapping("/summary/{batchId}")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable Long batchId) {
        List<HngJobCardResponse> cards = jobCardService.getByBatch(batchId);

        int totalProduced = cards.stream().mapToInt(HngJobCardResponse::getProducedQty).sum();
        int totalRejected = cards.stream().mapToInt(HngJobCardResponse::getRejectedQty).sum();

        double avgOee = cards.stream()
                .filter(c -> c.getOeePct() != null)
                .mapToDouble(c -> c.getOeePct().doubleValue())
                .average()
                .orElse(0.0);

        return ResponseEntity.ok(Map.of(
                "totalProduced", totalProduced,
                "totalRejected", totalRejected,
                "avgOee", avgOee,
                "count", cards.size()));
    }

    @GetMapping("/oee-summary")
    public ResponseEntity<HngOeeResponse> getOeeSummary() {
        return ResponseEntity.ok(jobCardService.getOeeSummary());
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable Long id) {
        com.example.multi_tanent.hanger.entity.HngJobCard jobCard = jobCardService.getById(id);
        byte[] pdfBytes = pdfService.generateJobCardPdf(jobCard);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=JobCard-" + jobCard.getJobCardNo() + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
